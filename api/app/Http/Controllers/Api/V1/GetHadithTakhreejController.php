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
        $compoundMatn = CompoundMatn::where('HadithMainID', $id)->first();

        return $this->jsonResponse([
            'book_name' => $hadith->BookName,
            'hadith_num' => $hadith->ID,
            'book_id' => $hadith->BookID,
            'takhreej' => $takhreejList,
            'shawahed' => [
                'has_shawahed' => $hasShawahed,
                'comparisons' => $comparisons,
            ],
            'combined_matn' => $compoundMatn ? [
                'id' => $compoundMatn->ID,
                'clean_matn' => $compoundMatn->CleanMatn,
                'matn_annotations' => $compoundMatn->MatnAnnotations,
                'asaned_comp' => $compoundMatn->AsanedComp,
            ] : null,
        ]);
    }
}
