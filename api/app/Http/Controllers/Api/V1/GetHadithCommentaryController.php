<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithCommentaryController extends Controller
{
    private BookTocService $serviceModel;

    public function __construct(BookTocService $serviceModel)
    {
        $this->serviceModel = $serviceModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hadithIds = \Illuminate\Support\Facades\DB::table('htakhreeg as t1')
            ->join('htakhreeg as t2', 't1.GroupID', '=', 't2.GroupID')
            ->where('t1.HadithMainID', $id)
            ->pluck('t2.HadithMainID')
            ->push($id)
            ->unique()
            ->values()
            ->toArray();

        $commentaries = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->whereIn('hs.HadithMainID', $hadithIds)
            ->where('hs.TypeID', 6) // الشروح
            ->select([
                'booktoc_services.MainID as id',
                'booktoc_services.BookName as book_name',
                'booktoc_services.CleanContent as content',
                'booktoc_services.Annotations as Annotations',
                'booktoc_services.NextParagraphID as next_id',
                'booktoc_services.ParentID as parent_id',
                'hs.HadithMainID'
            ])
            ->get();

        $groupedCommentaries = $commentaries->groupBy('book_name')->map(function ($items) use ($id) {
            // Prefer the explanation matching the exact current hadith
            $selected = $items->firstWhere('HadithMainID', $id) ?: $items->first();
            
            $fullContent = $selected->content;
            $nextId = $selected->next_id;
            $parentId = $selected->parent_id;
            
            $mergedAnnotations = [];
            $anno1 = $selected->Annotations;
            if (is_string($anno1)) {
                $anno1 = json_decode($anno1, true);
            }
            if (is_array($anno1)) {
                $mergedAnnotations = $anno1;
            }
            
            $currentOffset = mb_strlen($selected->content);
            
            while ($nextId != 0) {
                $nextNode = \Illuminate\Support\Facades\DB::table('booktoc_services')->where('MainID', $nextId)->first();
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
            
            $selected->content = $fullContent;
            $selected->Annotations = $mergedAnnotations;
            unset($selected->HadithMainID);
            unset($selected->next_id);
            return $selected;
        })->values();

        $hadith = \Illuminate\Support\Facades\DB::table('booktoc_hadith')->where('MainID', $id)->first();
        $book_name_primary = $hadith ? $hadith->BookName : '';
        $hadith_num_primary = $hadith ? $hadith->ID : '';

        return $this->jsonResponse([
            'success' => true,
            'book_name' => $book_name_primary,
            'hadith_num' => $hadith_num_primary,
            'commentaries' => $groupedCommentaries->toArray(),
        ]);
    }
}
