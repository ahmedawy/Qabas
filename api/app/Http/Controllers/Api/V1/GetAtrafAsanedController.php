<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

// phpcs:disable PSR1.Files.SideEffects

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAtrafAsanedController extends Controller
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
        $rawy = trim((string) $request->input('rawy', ''));
        $text = trim((string) $request->input('text', ''));

        if ($booksRaw === '') {
            return $this->jsonResponse([
                'results' => [],
            ]);
        }

        $bookIds = array_map('intval', explode(',', $booksRaw));

        $queryBuilder = $this->hadithModel->newQuery()
            ->select([
                'booktoc_hadith.MainID',
                'booktoc_hadith.Tarf as Text',
                'booktoc_hadith.BookName',
                'booktoc_hadith.ID as HadithNum',
                'booktoc_hadith.PartNum',
                'booktoc_hadith.PageNum',
            ])
            ->distinct()
            ->where('booktoc_hadith.IsLeaf', 1)
            ->whereIn('booktoc_hadith.BookID', $bookIds);

        if ($rawy !== '') {
            $queryBuilder->join('asanedhadiths', 'booktoc_hadith.MainID', '=', 'asanedhadiths.HadithMainID')
                ->join('asaned', 'asanedhadiths.SanadID', '=', 'asaned.ID')
                ->where(function ($q) use ($rawy) {
                    $q->where('asaned.SandRwah', 'like', '%'.$rawy.'%')
                        ->orWhereRaw('normalize_arabic(booktoc_hadith.Tarf) LIKE normalize_arabic(?)', ['%'.$rawy.'%']);
                });
        }

        if ($text !== '') {
            $queryBuilder->whereRaw('normalize_arabic(booktoc_hadith.Tarf) LIKE normalize_arabic(?)', ['%'.$text.'%']);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        $mapped = $results->map(fn (BookTocHadith $h) => [
            'MainID' => $h->MainID,
            'Text' => $h->getAttribute('Text') ?? $h->Tarf,
            'BookName' => $h->BookName,
            'HadithNum' => $h->HadithNum ?? $h->ID,
            'PartNum' => $h->PartNum,
            'PageNum' => $h->PageNum,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
        ]);
    }
}
