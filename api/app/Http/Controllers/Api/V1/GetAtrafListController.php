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
            ->where('IsLeaf', 1)
            ->whereIn('BookID', $bookIds);

        if ($letter !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Tarf) LIKE CONCAT(normalize_arabic(?), \'%\')', [$letter]);
        }

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Tarf) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        } else {
            $queryBuilder->whereNotNull('Tarf')->where('Tarf', '!=', '');
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        $mapped = $results->map(fn (BookTocHadith $h) => [
            'MainID' => $h->MainID,
            'Text' => $h->Tarf,
            'BookName' => $h->BookName,
            'HadithNum' => $h->ID,
            'PartNum' => $h->PartNum,
            'PageNum' => $h->PageNum,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
        ]);
    }
}
