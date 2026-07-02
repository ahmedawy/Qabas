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
                'hs.HadithMainID'
            ])
            ->get();

        $groupedCommentaries = $commentaries->groupBy('book_name')->map(function ($items) use ($id) {
            // Prefer the explanation matching the exact current hadith
            $exactMatch = $items->firstWhere('HadithMainID', $id);
            if ($exactMatch) {
                unset($exactMatch->HadithMainID);
                return $exactMatch;
            }
            
            $first = $items->first();
            unset($first->HadithMainID);
            return $first;
        })->values();

        return $this->jsonResponse([
            'success' => true,
            'commentaries' => $groupedCommentaries->toArray(),
        ]);
    }
}
