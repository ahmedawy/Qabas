<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use App\Models\HadithTakhreej;
use App\Models\HadithShawahed;
use App\Models\CompoundMatn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithTakhreejController extends Controller
{
    private BookTocHadith $hadithModel;

    public function __construct(BookTocHadith $hadithModel)
    {
        $this->hadithModel = $hadithModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hadith = $this->hadithModel->newQuery()
            ->select(['MainID', 'BookID', 'BookName', 'ID'])
            ->where('MainID', $id)
            ->first();

        if (! $hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }
        // 1. Fetch Takhreej cross-references
        $takhreejList = [];
        $takhreegRow = HadithTakhreej::where('HadithMainID', $id)->first();
        if ($takhreegRow && $takhreegRow->GroupID) {
            $relatedTakhreej = HadithTakhreej::where('GroupID', $takhreegRow->GroupID)->get();
            $relatedIds = $relatedTakhreej->pluck('HadithMainID')->toArray();
            
            // Bulk fetch metadata
            $allHadithData = DB::table('booktoc_hadith')
                ->join('hadith_books', 'booktoc_hadith.BookID', '=', 'hadith_books.ID')
                ->whereIn('booktoc_hadith.MainID', $relatedIds)
                ->select('booktoc_hadith.*', 'hadith_books.TakhreejAuthor', 'hadith_books.TakhreejBook', 'hadith_books.Tarteeb')
                ->orderBy('hadith_books.Tarteeb', 'asc')
                ->get()
                ->keyBy('MainID');
            
            // Group by BookID to bulk fetch wording comparisons
            $bookGroups = [];
            foreach ($allHadithData as $hData) {
                $bookGroups[$hData->BookID][] = $hData->MainID;
            }
            
            // Bulk fetch comments
            $comparisonsByRelatedId = [];
            foreach ($bookGroups as $bookId => $bookRelatedIds) {
                try {
                    $comparisonTable = "hmatncomparison{$bookId}";
                    $comps = DB::table($comparisonTable)
                        ->where(function($q) use ($id, $bookRelatedIds) {
                            $q->where('MasterMatnID', $id)->whereIn('SlaveMatnID', $bookRelatedIds);
                        })
                        ->orWhere(function($q) use ($id, $bookRelatedIds) {
                            $q->where('SlaveMatnID', $id)->whereIn('MasterMatnID', $bookRelatedIds);
                        })
                        ->get();
                    
                    foreach ($comps as $comp) {
                        $slaveId = ($comp->SlaveMatnID == $id) ? $comp->MasterMatnID : $comp->SlaveMatnID;
                        $comparisonsByRelatedId[$slaveId] = trim((string)$comp->Comment);
                    }
                } catch (\Exception $e) {
                    // Ignore missing tables
                }
            }

            $tempResults = [];
            foreach ($allHadithData as $relatedId => $hadithData) {
                $bookId = $hadithData->BookID;
                $bookName = trim((string)$hadithData->BookName);
                $volume = $hadithData->PartNum;
                $page = $hadithData->PageNum;
                $number = trim((string)$hadithData->TarqeemMatboa1);
                
                // Fetch chapter path (Medium Mode)
                $ancestors = DB::select("
                    WITH RECURSIVE HierarchyCTE AS (
                        SELECT MainID, ParentID, CleanContent, 1 AS Level
                        FROM booktoc_hadith
                        WHERE MainID = ? AND IsLeaf = 0
                        UNION ALL
                        SELECT parent.MainID, parent.ParentID, parent.CleanContent, child.Level + 1 AS Level
                        FROM booktoc_hadith parent
                        INNER JOIN HierarchyCTE child ON child.ParentID = parent.MainID
                        WHERE parent.IsLeaf = 0
                    )
                    SELECT CleanContent FROM HierarchyCTE ORDER BY Level DESC
                ", [$hadithData->ParentID]);
                
                $chapterPath = array_map(function($a) { return trim((string)$a->CleanContent); }, $ancestors);
                
                $comment = $comparisonsByRelatedId[$relatedId] ?? null;
                
                if (!isset($tempResults[$bookName])) {
                    $tempResults[$bookName] = [
                        'book_name' => $bookName,
                        'book_id' => $bookId,
                        'takhreej_author' => trim((string)$hadithData->TakhreejAuthor),
                        'takhreej_book' => trim((string)$hadithData->TakhreejBook),
                        'tarteeb' => $hadithData->Tarteeb,
                        'hadiths' => []
                    ];
                }
                
                $tempResults[$bookName]['hadiths'][] = [
                    'main_id' => $relatedId,
                    'volume' => $volume,
                    'page' => $page,
                    'number' => $number,
                    'chapter_path' => $chapterPath,
                    'comparison_comment' => $comment ?: null
                ];
            }
            
            $takhreejList = array_values($tempResults);
        }

        // 2. Fetch Motaba'at (Corroborating Chains)
        $hasShawahed = HadithShawahed::where('HadithMainID', $id)->exists();
        $comparisons = [];
        $bookId = $hadith->BookID;
        if ($hasShawahed && $bookId > 0) {
            $comparisons = DB::table("hmatncomparison{$bookId}")
                ->where('MasterMatnID', $id)
                ->join('booktoc_hadith', "hmatncomparison{$bookId}.SlaveMatnID", '=', 'booktoc_hadith.MainID')
                ->select(
                    "hmatncomparison{$bookId}.SlaveMatnID",
                    "hmatncomparison{$bookId}.Comment",
                    "hmatncomparison{$bookId}.MatchSort",
                    'booktoc_hadith.BookID',
                    'booktoc_hadith.BookName',
                    'booktoc_hadith.ID as HadithNum',
                    'booktoc_hadith.Tarf'
                )
                ->get();
        }

        // 3. Fetch Combined Matn (المتون المجمعة)
        $compoundMatn = null;
        if ($takhreegRow && $takhreegRow->CompoundMatnID) {
            $compoundMatn = CompoundMatn::where('ID', $takhreegRow->CompoundMatnID)->first();
        }
        if (! $compoundMatn) {
            $compoundMatn = CompoundMatn::where('HadithMainID', $id)->first();
        }

        return $this->jsonResponse([
            'book_name' => $hadith->BookName,
            'hadith_num' => $hadith->ID,
            'book_id' => $hadith->BookID,
            'takhreej' => $takhreejList,
            'shawahed' => [
                'has_shawahed' => $hasShawahed,
                'comparisons' => $comparisons,
            ],
            'combined_matn' => $compoundMatn ? array_merge([
                'id' => $compoundMatn->ID,
                'clean_matn' => $compoundMatn->CleanMatn,
                'matn_annotations' => $compoundMatn->MatnAnnotations,
                'asaned_comp' => $compoundMatn->AsanedComp,
            ], $this->formatScholarlyCombinedMatn($compoundMatn)) : null,
        ]);
    }

    /**
     * Formats the combined matn into a scholarly version with bracketed additions and reference numbers,
     * and compiles the full original wording + variant sources reference block.
     */
    private function formatScholarlyCombinedMatn(CompoundMatn $compoundMatn): array
    {
        $cleanMatn = $compoundMatn->CleanMatn;
        $ann = $compoundMatn->MatnAnnotations;
        if (!is_array($ann)) {
            $ann = [];
        }

        // 1. Build scholarly_matn
        $hits = array_filter($ann, function($a) {
            return isset($a['type']) && $a['type'] === 'MMHit';
        });

        // Sort hits descending by start position to replace from end to beginning
        usort($hits, function($a, $b) {
            return $b['start'] <=> $a['start'];
        });

        $formattedMatn = $cleanMatn;
        foreach ($hits as $hit) {
            $start = (int)$hit['start'];
            $len = (int)$hit['length'];
            $mmid = (int)($hit['attrs']['MMID'] ?? 0);
            
            $sub = mb_substr($cleanMatn, $start, $len);
            
            // Preserve original leading and trailing spaces outside of the brackets
            $leadSpace = preg_match('/^\s+/', $sub, $m) ? $m[0] : '';
            $trailSpace = preg_match('/\s+$/', $sub, $m) ? $m[0] : '';
            $trimmedSub = trim($sub);
            $num = $mmid + 1;
            $replacement = "{$leadSpace}[{$trimmedSub} ({$num})]{$trailSpace}";
            
            $left = mb_substr($formattedMatn, 0, $start);
            $right = mb_substr($formattedMatn, $start + $len);
            
            $formattedMatn = $left . $replacement . $right;
        }

        // 2. Build parent-child mapping for sources
        $children = [];
        foreach ($ann as $idx => $a) {
            $parent = $a['parentIndex'] ?? null;
            if ($parent !== null) {
                $children[$parent][] = array_merge(['_index' => $idx], $a);
            }
        }

        // Find MMMainHadith (Original Wording)
        $originalWording = '';
        $mainHadithNode = null;
        foreach ($ann as $idx => $a) {
            if (isset($a['type']) && $a['type'] === 'MMMainHadith') {
                $mainHadithNode = array_merge(['_index' => $idx], $a);
                break;
            }
        }

        if ($mainHadithNode) {
            $mIdx = $mainHadithNode['_index'];
            $originalWordingParts = [];
            if (isset($children[$mIdx])) {
                foreach ($children[$mIdx] as $book) {
                    if ($book['type'] === 'MutonBook') {
                        $bookName = trim($book['attrs']['BookName'] ?? '');
                        $docs = [];
                        if (isset($children[$book['_index']])) {
                            foreach ($children[$book['_index']] as $doc) {
                                if ($doc['type'] === 'Document') {
                                    $hadithNum = trim($doc['attrs']['HadithNum'] ?? '');
                                    $part = trim($doc['attrs']['PartNum'] ?? '');
                                    $page = trim($doc['attrs']['PageNum'] ?? '');
                                    $docs[] = "{$bookName}: ({$part} / {$page}) برقم: ({$hadithNum})";
                                }
                            }
                        }
                        if (!empty($docs)) {
                            $originalWordingParts[] = implode("\n", $docs);
                        }
                    }
                }
            }
            $originalWording = implode("\n", $originalWordingParts);
        }

        // Find MMPortionSources (Additions/Variants)
        $variantsList = [];
        $variantSourcesMap = [];
        foreach ($ann as $idx => $a) {
            if (isset($a['type']) && $a['type'] === 'MMPortionSources') {
                $mmid = (int)($a['attrs']['ID'] ?? 0);
                $num = $mmid + 1;
                
                $variantSources = [];
                if (isset($children[$idx])) {
                    foreach ($children[$idx] as $muton) {
                        if ($muton['type'] === 'Muton') {
                            $mIdx = $muton['_index'];
                            if (isset($children[$mIdx])) {
                                foreach ($children[$mIdx] as $book) {
                                    if ($book['type'] === 'MutonBook') {
                                        $bookName = trim($book['attrs']['BookName'] ?? '');
                                        if (isset($children[$book['_index']])) {
                                            foreach ($children[$book['_index']] as $doc) {
                                                if ($doc['type'] === 'Document') {
                                                    $hadithNum = trim($doc['attrs']['HadithNum'] ?? '');
                                                    $part = trim($doc['attrs']['PartNum'] ?? '');
                                                    $page = trim($doc['attrs']['PageNum'] ?? '');
                                                    $variantSources[] = "{$bookName}: ({$part} / {$page}) برقم: ({$hadithNum})";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (!empty($variantSources)) {
                    $variantSourcesMap[$mmid] = implode("\n", $variantSources);
                    
                    $first = true;
                    $formattedVariant = '';
                    foreach ($variantSources as $vs) {
                        if ($first) {
                            $formattedVariant .= "({$num}) {$vs}";
                            $first = false;
                        } else {
                            $formattedVariant .= "\n{$vs}";
                        }
                    }
                    $variantsList[$num] = $formattedVariant;
                }
            }
        }

        // Sort variants by 1-based index key
        ksort($variantsList);

        // Construct full scholarly_sources block
        $sourcesBlock = "--------------------------------------------------------------------------------\n";
        $sourcesBlock .= " الرواية الأصلية : \n";
        $sourcesBlock .= $originalWording . "\n\n\n";
        $sourcesBlock .= "الزوائد:\n";
        $sourcesBlock .= implode("\n\n", $variantsList);

        // 3. Build structured segments for interactive web tooltips
        $hitsAsc = array_filter($ann, function($a) {
            return isset($a['type']) && $a['type'] === 'MMHit';
        });
        usort($hitsAsc, function($a, $b) {
            return (int)$a['start'] <=> (int)$b['start'];
        });

        $segments = [];
        $currentOffset = 0;
        foreach ($hitsAsc as $hit) {
            $start = (int)$hit['start'];
            $len = (int)$hit['length'];
            $mmid = (int)($hit['attrs']['MMID'] ?? 0);

            // Plain text segment before this hit
            if ($start > $currentOffset) {
                $segments[] = [
                    'type' => 'text',
                    'text' => mb_substr($cleanMatn, $currentOffset, $start - $currentOffset),
                ];
            }

            // Variant segment
            $sub = mb_substr($cleanMatn, $start, $len);
            $leadSpace = preg_match('/^\s+/', $sub, $m) ? $m[0] : '';
            $trailSpace = preg_match('/\s+$/', $sub, $m) ? $m[0] : '';
            $trimmedSub = trim($sub);

            $segments[] = [
                'type' => 'variant',
                'id' => $mmid + 1,
                'text' => $trimmedSub,
                'leadSpace' => $leadSpace,
                'trailSpace' => $trailSpace,
                'sources' => $variantSourcesMap[$mmid] ?? '',
            ];

            $currentOffset = $start + $len;
        }

        // Remaining text
        if ($currentOffset < mb_strlen($cleanMatn)) {
            $segments[] = [
                'type' => 'text',
                'text' => mb_substr($cleanMatn, $currentOffset),
            ];
        }

        return [
            'scholarly_matn' => $formattedMatn,
            'scholarly_sources' => $sourcesBlock,
            'scholarly_segments' => $segments,
        ];
    }
}
