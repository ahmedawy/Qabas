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
                'booktoc_hadith.ServiceFlags',
            ])
            ->distinct()
            ->where('booktoc_hadith.IsLeaf', 1)
            ->whereIn('booktoc_hadith.BookID', $bookIds);

        if ($rawy !== '') {
            $queryBuilder->join('asanedhadiths', 'booktoc_hadith.MainID', '=', 'asanedhadiths.HadithMainID')
                ->join('asaned', 'asanedhadiths.SanadID', '=', 'asaned.ID')
                ->where(function ($q) use ($rawy) {
                    if (is_numeric($rawy)) {
                        $q->whereRaw('MATCH(asaned.SandRwah_Normalized) AGAINST(? IN BOOLEAN MODE)', ["+narrator_{$rawy}"]);
                    } else {
                        $normalizedRawy = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$rawy])->q;
                        $words = array_filter(explode(' ', $normalizedRawy));
                        $matchQuery = implode('* ', $words) . '*';
                        $q->whereRaw('MATCH(booktoc_hadith.Tarf_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery]);
                    }
                });
        }

        if ($text !== '') {
            $normalizedText = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$text])->q;
            $words = array_filter(explode(' ', $normalizedText));
            $matchQuery = implode('* ', $words) . '*';
            $queryBuilder->whereRaw('MATCH(booktoc_hadith.Tarf_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery]);
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
