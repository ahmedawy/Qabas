<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetNarratorsByBookController extends Controller
{
    private Narrator $narratorModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(Narrator $narratorModel)
    {
        $this->narratorModel = $narratorModel;
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

        $queryBuilder = $this->narratorModel->newQuery()
            ->where('IsRawy', 1)
            ->whereHas('books', function ($q) use ($bookIds) {
                $q->whereIn('nounsbooks.BookID', $bookIds);
            });

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Name) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->select(['nouns.ID', 'nouns.Name', 'nouns.Tabaqa', 'nouns.HadithsCount'])
            ->orderBy('HadithsCount', 'desc')
            ->limit(50)
            ->get();

        $mappedResults = $results->map(function (Narrator $narrator) {
            $sheikhs = $narrator->teachers()->limit(3)->pluck('Name')->implode('، ');
            $talamidh = $narrator->students()->limit(3)->pluck('Name')->implode('، ');

            return [
                'ID' => $narrator->ID,
                'Name' => $narrator->Name,
                'Tabaqa' => $narrator->Tabaqa,
                'HadithsCount' => $narrator->HadithsCount,
                'sheikhs' => $sheikhs,
                'talamidh' => $talamidh,
            ];
        });

        return $this->jsonResponse([
            'results' => $mappedResults,
        ]);
    }
}
