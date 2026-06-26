<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatnDateResource;
use App\Models\MatnDate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetDatesController extends Controller
{
    private MatnDate $matnDateModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(MatnDate $matnDateModel)
    {
        $this->matnDateModel = $matnDateModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));

        $queryBuilder = $this->matnDateModel->newQuery();

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Text) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => MatnDateResource::collection($results),
        ]);
    }
}
