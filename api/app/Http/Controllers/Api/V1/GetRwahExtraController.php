<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookExtra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetRwahExtraController extends Controller
{
    private BookExtra $bookExtraModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(BookExtra $bookExtraModel)
    {
        $this->bookExtraModel = $bookExtraModel;
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

        $queryBuilder = $this->bookExtraModel->newQuery()
            ->join('nouns', 'bookextra.RawyID', '=', 'nouns.ID')
            ->whereIn('bookextra.BookID', $bookIds)
            ->select([
                'nouns.ID as ID',
                'nouns.Name as Name',
                'nouns.Tabaqa as Tabaqa',
                'bookextra.Count as HadithsCount',
            ]);

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(nouns.Name) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->orderBy('bookextra.Count', 'desc')
            ->limit(50)
            ->get();

        $mappedResults = $results->map(fn (BookExtra $r) => [
            'ID' => (int) $r->getAttribute('ID'),
            'Name' => (string) $r->getAttribute('Name'),
            'Tabaqa' => (string) $r->getAttribute('Tabaqa'),
            'HadithsCount' => (int) $r->getAttribute('HadithsCount'),
        ]);

        return $this->jsonResponse([
            'results' => $mappedResults,
        ]);
    }
}
