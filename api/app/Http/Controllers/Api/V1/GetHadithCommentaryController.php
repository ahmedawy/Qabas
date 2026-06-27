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

        $commentaries = $this->serviceModel->newQuery()
            ->join('hadithsservices as hs', 'booktoc_services.MainID', '=', 'hs.ServiceMainID')
            ->where('hs.HadithMainID', $id)
            ->where('hs.TypeID', 6) // الشروح
            ->select([
                'booktoc_services.MainID as id',
                'booktoc_services.BookName as book_name',
                'booktoc_services.CleanContent as content',
            ])
            ->get();

        return $this->jsonResponse([
            'success' => true,
            'commentaries' => $commentaries->toArray(),
        ]);
    }
}
