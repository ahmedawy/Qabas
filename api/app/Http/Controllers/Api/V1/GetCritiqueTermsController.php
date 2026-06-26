<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CritiqueTermResource;
use App\Models\CritiqueTerm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetCritiqueTermsController extends Controller
{
    private CritiqueTerm $critiqueTermModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(CritiqueTerm $critiqueTermModel)
    {
        $this->critiqueTermModel = $critiqueTermModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        $queryBuilder = $this->critiqueTermModel->newQuery()
            ->whereNotNull('Text')
            ->withCount('links');

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Text) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->orderBy('Sort')
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => CritiqueTermResource::collection($results),
        ]);
    }
}
