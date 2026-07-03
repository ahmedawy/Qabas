<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithOccasionsController extends Controller
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

        // Fetch all occasions of revelation (TypeID = 7)
        $occasions = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->whereIn('hs.HadithMainID', $hadithIds)
            ->where('hs.TypeID', 7) // أسباب الورود
            ->select([
                'booktoc_services.Tarf as event_name',
                'booktoc_services.CleanContent as description',
                'booktoc_services.PartNum as part',
                'booktoc_services.PageNum as page',
                'booktoc_services.BookName as book_name',
                'booktoc_services.Annotations as Annotations',
                'hs.HadithMainID'
            ])
            ->get();

        $grouped = $occasions->groupBy('book_name')->map(function ($items) use ($id) {
            $exactMatch = $items->firstWhere('HadithMainID', $id);
            if ($exactMatch) {
                return $exactMatch;
            }
            return $items->first();
        })->values();

        $results = [];
        foreach ($grouped as $occ) {
            $results[] = [
                'event_name' => $occ->event_name ?: 'سبب الورود',
                'description' => $occ->description,
                'Annotations' => $occ->Annotations,
                'date' => ($occ->part && $occ->page) ? "جزء {$occ->part}، صفحة {$occ->page}" : 'سياق أثري/تاريخي',
            ];
        }

        $hadith = \Illuminate\Support\Facades\DB::table('booktoc_hadith')->where('MainID', $id)->first();
        $book_name_primary = $hadith ? $hadith->BookName : '';
        $hadith_num_primary = $hadith ? $hadith->ID : '';

        return $this->jsonResponse([
            'success' => true,
            'book_name' => $book_name_primary,
            'hadith_num' => $hadith_num_primary,
            'occasions' => $results,
        ]);
    }
}
