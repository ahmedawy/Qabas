<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TocNodeResource;
use App\Models\BookTocHadith;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetBookTocController extends Controller
{
    private BookTocHadith $hadithModel;

    private BookTocService $serviceModel;

    /**
     * Inject models via constructor.
     */
    public function __construct(BookTocHadith $hadithModel, BookTocService $serviceModel)
    {
        $this->hadithModel = $hadithModel;
        $this->serviceModel = $serviceModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $bookId = (int) $request->input('book_id');
        $type = $request->input('type', 'hadith');

        if ($bookId <= 0) {
            return $this->errorResponse('Invalid Book ID', 400);
        }

        $selectColumns = ['MainID', 'ParentID', 'IsLeaf', 'Tarf'];

        if ($type === 'hadith') {
            $toc = $this->hadithModel->newQuery()
                ->select($selectColumns)
                ->where('BookID', $bookId)
                ->where('IsLeaf', 0)
                ->orderBy('MainID')
                ->limit(5000)
                ->get();
        } else {
            $toc = $this->serviceModel->newQuery()
                ->select($selectColumns)
                ->where('BookID', $bookId)
                ->where('IsLeaf', 0)
                ->orderBy('MainID')
                ->limit(5000)
                ->get();
        }

        return $this->jsonResponse([
            'book_id' => $bookId,
            'toc' => TocNodeResource::collection($toc),
        ]);
    }
}
