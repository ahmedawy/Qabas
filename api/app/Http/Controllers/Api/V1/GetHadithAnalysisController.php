<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithAnalysisController extends Controller
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

        // Fetch all sciences/analyses that are not commentaries (6) or occasions (7)
        $analyses = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->join('hadithsservicestypes as t', 'hs.TypeID', '=', 't.ID')
            ->whereIn('hs.HadithMainID', $hadithIds)
            ->whereNotIn('hs.TypeID', [6, 7])
            ->select([
                't.Name as Title',
                'booktoc_services.CleanContent as Content',
                'booktoc_services.BookName as BookName',
                'booktoc_services.Annotations as Annotations',
                'hs.HadithMainID'
            ])
            ->get();

        $grouped = $analyses->groupBy(function ($item) {
            return $item->Title . '_' . $item->BookName;
        })->map(function ($items) use ($id) {
            $exactMatch = $items->firstWhere('HadithMainID', $id);
            if ($exactMatch) {
                return $exactMatch;
            }
            return $items->first();
        })->values();

        $results = [];
        foreach ($grouped as $item) {
            $results[] = [
                'Title' => $item->Title,
                'Content' => $item->Content,
                'Annotations' => $item->Annotations,
            ];
        }

        $hadith = \Illuminate\Support\Facades\DB::table('booktoc_hadith')->where('MainID', $id)->first();
        $book_name_primary = $hadith ? $hadith->BookName : '';
        $hadith_num_primary = $hadith ? $hadith->ID : '';

        return $this->jsonResponse([
            'success' => true,
            'book_name' => $book_name_primary,
            'hadith_num' => $hadith_num_primary,
            'analysis' => $results,
        ]);
    }
}
