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

        // Fetch all occasions of revelation (TypeID = 7)
        $occasions = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->where('hs.HadithMainID', $id)
            ->where('hs.TypeID', 7) // أسباب الورود
            ->select([
                'booktoc_services.Tarf as event_name',
                'booktoc_services.CleanContent as description',
                'booktoc_services.PartNum as part',
                'booktoc_services.PageNum as page',
            ])
            ->get();

        $results = [];
        foreach ($occasions as $occ) {
            $results[] = [
                'event_name' => $occ->event_name ?: 'سبب الورود',
                'description' => $occ->description,
                'date' => ($occ->part && $occ->page) ? "جزء {$occ->part}، صفحة {$occ->page}" : 'سياق أثري/تاريخي',
            ];
        }

        return $this->jsonResponse([
            'success' => true,
            'occasions' => $results,
        ]);
    }
}
