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

        // Fetch all sciences/analyses that are not commentaries (6) or occasions (7)
        $analyses = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->join('hadithsservicestypes as t', 'hs.TypeID', '=', 't.ID')
            ->where('hs.HadithMainID', $id)
            ->whereNotIn('hs.TypeID', [6, 7])
            ->select([
                't.Name as Title',
                'booktoc_services.CleanContent as Content',
            ])
            ->get();

        return $this->jsonResponse([
            'success' => true,
            'analysis' => $analyses->toArray(),
        ]);
    }
}
