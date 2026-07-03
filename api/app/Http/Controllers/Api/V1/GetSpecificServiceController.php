<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GetSpecificServiceController extends Controller
{
    public function __invoke($hadithId, $typeId): JsonResponse
    {
        $services = DB::table('hadithsservices as hs')
            ->join('booktoc_services as bts', 'hs.ServiceMainID', '=', 'bts.MainID')
            ->where('hs.HadithMainID', (int) $hadithId)
            ->where('hs.TypeID', (int) $typeId)
            ->select('bts.MainID', 'bts.BookName as book_name', 'bts.CleanContent as content', 'bts.PartNum as part', 'bts.PageNum as page', 'bts.NextParagraphID', 'bts.ParentID as parent_id', 'bts.Annotations as Annotations')
            ->get();

        $books = [];
        foreach ($services as $service) {
            $bookName = $service->book_name;
            if (!isset($books[$bookName])) {
                $books[$bookName] = [];
            }
            
            $prefix = "";
            if ($service->part > 0 || $service->page > 0) {
                $prefix = "جزء: " . $service->part . " صفحة: " . $service->page . "\n";
            }
            
            $fullContent = $service->content;
            $mergedAnnotations = [];
            $currentOffset = mb_strlen($prefix);
            
            $anno1 = json_decode($service->Annotations, true);
            if (is_array($anno1)) {
                foreach ($anno1 as $ann) {
                    $ann['start'] += $currentOffset;
                    $mergedAnnotations[] = $ann;
                }
            }
            
            $currentOffset += mb_strlen($service->content);
            
            $nextId = $service->NextParagraphID;
            $parentId = $service->parent_id;
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

        $hadith = DB::table('booktoc_hadith')->where('MainID', (int) $hadithId)->first();
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
