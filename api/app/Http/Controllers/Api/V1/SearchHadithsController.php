<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchHadithsController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject model dependency.
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
        // Extend time limit for expensive global search queries
        set_time_limit(300);

        $q = $request->input('q');
        $q = is_string($q) ? trim($q) : '';

        $bookId = (int) $request->input('book_id');
        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 10);

        if ($page < 1) {
            $page = 1;
        }
        if ($limit < 1 || $limit > 100) {
            $limit = 10;
        }

        if ($q === '') {
            return $this->jsonResponse([
                'total' => 0,
                'page' => $page,
                'limit' => $limit,
                'results' => [],
            ]);
        }

        $query = $this->hadithModel->newQuery()
            ->where('IsLeaf', 1);

        if ($bookId > 0) {
            $query->where('BookID', $bookId);
        }

        // Apply morphological stored procedure filter
        $query->whereRaw(
            'normalize_arabic(CleanContent) LIKE normalize_arabic(?)',
            ['%'.$q.'%']
        );

        $total = $query->count();

        $results = $query->select([
            'MainID', 'BookID', 'BookName', 'ID', 'PartNum', 'PageNum', 'Tarf', 'CleanContent', 'Annotations'
        ])
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return $this->jsonResponse([
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'results' => HadithSummaryResource::collection($results),
        ]);
    }
}
