<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithByPageController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject model.
     */
    public function __construct(BookTocHadith $hadithModel)
    {
        $this->hadithModel = $hadithModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $bookId = (int) $request->input('book_id');
        $page = (int) $request->input('page');
        $part = (int) $request->input('part', 0);

        if ($bookId <= 0 || $page <= 0) {
            return $this->errorResponse('Invalid parameters: book_id and page are required', 400);
        }

        $query = $this->hadithModel->newQuery()
            ->where('BookID', $bookId)
            ->where('PageNum', $page)
            ->where('IsLeaf', 1);

        if ($part > 0) {
            $query->where('PartNum', $part);
        }

        $hadiths = $query->limit(50)->get();

        return $this->jsonResponse([
            'hadiths' => HadithSummaryResource::collection($hadiths),
        ]);
    }
}
