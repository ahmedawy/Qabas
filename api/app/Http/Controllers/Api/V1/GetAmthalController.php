<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProverbResource;
use App\Models\Proverb;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAmthalController extends Controller
{
    private Proverb $proverbModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(Proverb $proverbModel)
    {
        $this->proverbModel = $proverbModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        $queryBuilder = $this->proverbModel->newQuery();

        if ($query !== '') {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$query])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            $matchQuery = implode('* ', $words) . '*';

            $queryBuilder->whereRaw('MATCH(Text_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery]);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => ProverbResource::collection($results),
        ]);
    }
}
