<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAtrafListController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject constructor dependencies.
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
        $booksRaw = trim((string) $request->input('books', ''));
        $query = trim((string) $request->input('q', ''));

        if ($booksRaw === '') {
            return $this->jsonResponse([
                'results' => [],
            ]);
        }

        $bookIds = array_map('intval', explode(',', $booksRaw));
        $letter = trim((string) $request->input('letter', ''));

        $queryBuilder = $this->hadithModel->newQuery()
            ->select('booktoc_hadith.*')
            ->where('booktoc_hadith.IsLeaf', 1)
            ->whereIn('booktoc_hadith.BookID', $bookIds);

        $hadithTypes = $request->input('hadith_types');
        if (is_array($hadithTypes) && count($hadithTypes) > 0) {
            $queryBuilder->whereExists(function ($q) use ($hadithTypes) {
                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('hadith_type_map')
                    ->join('hadith_types', 'hadith_types.id', '=', 'hadith_type_map.type_id')
                    ->whereColumn('hadith_type_map.hadith_main_id', 'booktoc_hadith.MainID')
                    ->whereIn('hadith_types.slug', $hadithTypes);
            });
        }

        if ($letter !== '') {
            $queryBuilder->whereRaw('normalize_arabic(booktoc_hadith.Tarf) LIKE CONCAT(normalize_arabic(?), \'%\')', [$letter]);
        }

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(booktoc_hadith.Tarf) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        } else {
            $queryBuilder->whereNotNull('booktoc_hadith.Tarf')->where('booktoc_hadith.Tarf', '!=', '');
        }

        $perPage = max(1, min(100, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $paginator = $queryBuilder
            ->orderBy('booktoc_hadith.BookID', 'asc')
            ->orderBy('booktoc_hadith.ID', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        $mapped = collect($paginator->items())->map(fn (BookTocHadith $h) => [
            'MainID' => $h->MainID,
            'Text' => $h->Tarf,
            'BookName' => $h->BookName,
            'HadithNum' => $h->ID,
            'PartNum' => $h->PartNum,
            'PageNum' => $h->PageNum,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
