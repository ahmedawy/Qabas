<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NarratorSummaryResource;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListNarratorsController extends Controller
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
        $query = trim((string) $request->input('q', ''));
        $fieldsInput = $request->input('fields');
        $fields = is_string($fieldsInput) ? explode(',', $fieldsInput) : ['Name'];

        if ($query === '') {
            return $this->jsonResponse([
                'results' => [],
            ]);
        }

        $allowed = ['Name', 'Kunia', 'Laqab', 'Nasab', 'EsmShuhra'];
        $validFields = [];

        foreach ($fields as $f) {
            $field = trim($f);
            if (in_array($field, $allowed, true)) {
                $validFields[] = $field;
            }
        }

        if ($validFields === []) {
            $validFields[] = 'Name';
        }

        $queryBuilder = $this->narratorModel->newQuery()
            ->where('IsRawy', 1);

        $queryBuilder->where(function ($subQuery) use ($validFields, $query) {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$query])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            $matchQuery = implode('* ', $words) . '*';

            foreach ($validFields as $index => $field) {
                if ($field === 'Name') {
                    $sql = "MATCH(Name_Normalized) AGAINST(? IN BOOLEAN MODE)";
                    $binding = $matchQuery;
                } else {
                    $sql = "normalize_arabic({$field}) LIKE normalize_arabic(?)";
                    $binding = '%'.$query.'%';
                }

                if ($index === 0) {
                    $subQuery->whereRaw($sql, [$binding]);
                } else {
                    $subQuery->orWhereRaw($sql, [$binding]);
                }
            }
        });

        $results = $queryBuilder
            ->select(['ID', 'Name', 'AbbName', 'Kunia', 'Laqab', 'Tabaqa', 'DeathYear', 'HadithsCount'])
            ->orderBy('HadithsCount', 'desc')
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => NarratorSummaryResource::collection($results),
        ]);
    }
}
