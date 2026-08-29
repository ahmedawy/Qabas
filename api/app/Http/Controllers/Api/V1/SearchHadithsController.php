<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $hadithTypes = $request->input('hadith_types');
        $hasTypes = is_array($hadithTypes) && count($hadithTypes) > 0;

        if ($q === '' && !$hasTypes) {
            return $this->jsonResponse([
                'total' => 0,
                'page' => $page,
                'limit' => $limit,
                'results' => [],
            ]);
        }

        $query = $this->hadithModel->newQuery()
            ->where('booktoc_hadith.IsLeaf', 1);

        if ($bookId > 0) {
            $query->where('booktoc_hadith.BookID', $bookId);
        }

        if ($hasTypes) {
            $query->whereExists(function ($q) use ($hadithTypes) {
                $q->select(DB::raw(1))
                    ->from('hadith_type_map')
                    ->join('hadith_types', 'hadith_types.id', '=', 'hadith_type_map.type_id')
                    ->whereColumn('hadith_type_map.hadith_main_id', 'booktoc_hadith.MainID')
                    ->whereIn('hadith_types.slug', $hadithTypes);
            });
        }

        // Apply morphological stored procedure filter
        if ($q !== '') {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$q])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            
            if (count($words) > 0) {
                $matchQuery = implode('* ', $words) . '*';

                $query->whereRaw(
                    'MATCH(booktoc_hadith.CleanContent_Normalized) AGAINST(? IN BOOLEAN MODE)',
                    [$matchQuery]
                );
            }
        }

        $total = $query->count();

        $results = $query->select([
            'booktoc_hadith.MainID',
            'booktoc_hadith.BookID',
            'booktoc_hadith.BookName',
            'booktoc_hadith.ID',
            'booktoc_hadith.PartNum',
            'booktoc_hadith.PageNum',
            'booktoc_hadith.Tarf',
            'booktoc_hadith.CleanContent',
            'booktoc_hadith.Annotations',
            'booktoc_hadith.ServiceFlags'
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
