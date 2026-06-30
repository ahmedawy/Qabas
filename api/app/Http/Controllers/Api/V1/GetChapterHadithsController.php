<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\BookTocHadith;
use App\Models\BookTocService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetChapterHadithsController extends Controller
{
    private BookTocHadith $hadithModel;

    private BookTocService $serviceModel;

    /**
     * Inject models.
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
        $chapterId = (int) $request->input('chapter_id');
        $bookId = (int) $request->input('book_id');

        if ($chapterId <= 0) {
            return $this->errorResponse('Invalid chapter ID', 400);
        }

        $limit = (int) $request->input('limit', 50);
        if ($limit <= 0 || $limit > 200) {
            $limit = 50;
        }
        $page = (int) $request->input('page', 1);
        if ($page <= 0) {
            $page = 1;
        }
        $offset = ($page - 1) * $limit;

        $type = $request->input('type', 'hadith');

        if ($type === 'hadith') {
            $hadiths = \App\Models\BookTocHadith::getDescendantLeaves($chapterId, $limit, $offset);
        } else {
            $hadiths = \App\Models\BookTocService::getDescendantLeaves($chapterId, $limit, $offset);
        }

        $nextPage = count($hadiths) === $limit ? $page + 1 : null;

        return $this->jsonResponse([
            'hadiths' => HadithSummaryResource::collection($hadiths),
            'next_page' => $nextPage,
        ]);
    }
}
