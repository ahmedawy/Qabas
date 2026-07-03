<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GetHadithTafseerController extends Controller
{
    public function __invoke($hadithId): JsonResponse
    {
        $hadith = DB::table('booktoc_hadith')->where('MainID', (int) $hadithId)->first();
        if (!$hadith || !$hadith->Annotations) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $annotations = json_decode($hadith->Annotations, true);
        if (!is_array($annotations)) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }

        $verses = [];
        foreach ($annotations as $anno) {
            if (isset($anno['type']) && $anno['type'] === 'آية' && isset($anno['attrs']['رقم_السورة']) && isset($anno['attrs']['الآية'])) {
                $verses[] = [
                    'sura' => (int) $anno['attrs']['رقم_السورة'],
                    'aya' => (int) $anno['attrs']['الآية']
                ];
            }
        }

        $books = [];
        foreach ($verses as $verse) {
            $data = DB::table('quranayatdescrp as q')
                ->join('booktoc_services as bts', 'q.ServiceMainID', '=', 'bts.MainID')
                ->where('q.Sura', $verse['sura'])
                ->where('q.Aya', $verse['aya'])
                ->select('bts.MainID', 'bts.BookName as book_name', 'bts.CleanContent as content', 'bts.PartNum as part', 'bts.PageNum as page', 'bts.NextParagraphID', 'bts.ParentID as parent_id', 'bts.Annotations as Annotations')
                ->get();

            foreach ($data as $d) {
                $bookName = $d->book_name;
                if (!isset($books[$bookName])) {
                    $books[$bookName] = [];
                }
                
                $prefix = "";
                if ($d->part > 0 || $d->page > 0) {
                    $prefix = "جزء: " . $d->part . " صفحة: " . $d->page . "\n";
                }
                
                $fullContent = $d->content;
                $mergedAnnotations = [];
                $currentOffset = mb_strlen($prefix);
                
                $anno1 = json_decode($d->Annotations, true);
                if (is_array($anno1)) {
                    foreach ($anno1 as $ann) {
                        $ann['start'] += $currentOffset;
                        $mergedAnnotations[] = $ann;
                    }
                }
                
                $currentOffset += mb_strlen($d->content);
                
                $nextId = $d->NextParagraphID;
                $parentId = $d->parent_id;
                while ($nextId != 0) {
                    $nextNode = DB::table('booktoc_services')->where('MainID', $nextId)->first();
                    if (!$nextNode || $nextNode->ParentID != $parentId) break;
                    
                    $fullContent .= "\n" . $nextNode->CleanContent;
                    $currentOffset += 1; // accounting for "\n"
                    
                    $annoNext = json_decode($nextNode->Annotations, true);
                    if (is_array($annoNext)) {
                        foreach ($annoNext as $ann) {
                            $ann['start'] += $currentOffset;
                            $mergedAnnotations[] = $ann;
                        }
                    }
                    
                    $currentOffset += mb_strlen($nextNode->CleanContent);
                    $nextId = $nextNode->NextParagraphID;
                }
                
                $contentWithRef = $prefix . $fullContent;
                
                $books[$bookName][] = [
                    'content' => $contentWithRef,
                    'annotations' => $mergedAnnotations
                ];
            }
        }

        $results = [];
        foreach ($books as $bookName => $items) {
            $uniqueContents = [];
            $combinedContent = "";
            $combinedAnnotations = [];
            $offset = 0;
            
            foreach ($items as $item) {
                if (in_array($item['content'], $uniqueContents)) continue;
                $uniqueContents[] = $item['content'];
                
                if ($combinedContent !== "") {
                    $sep = "\n\n<hr/>\n\n";
                    $combinedContent .= $sep;
                    $offset += mb_strlen($sep);
                }
                
                foreach ($item['annotations'] as $ann) {
                    $ann['start'] += $offset;
                    $combinedAnnotations[] = $ann;
                }
                
                $combinedContent .= $item['content'];
                $offset += mb_strlen($item['content']);
            }
            
            $results[] = [
                'book_name' => $bookName,
                'content' => $combinedContent,
                'Annotations' => $combinedAnnotations
            ];
        }

        $book_name_primary = $hadith ? $hadith->BookName : '';
        $hadith_num_primary = $hadith ? $hadith->ID : '';

        return response()->json([
            'status' => 'success',
            'book_name' => $book_name_primary,
            'hadith_num' => $hadith_num_primary,
            'data' => $results
        ]);
    }
}
