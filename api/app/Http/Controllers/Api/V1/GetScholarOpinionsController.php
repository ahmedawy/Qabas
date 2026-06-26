<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ScholarOpinionResource;
use App\Models\JudgmentScientist;
use App\Models\NarratorScientistSay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetScholarOpinionsController extends Controller
{
    private JudgmentScientist $judgmentScientistModel;

    private NarratorScientistSay $narratorScientistSayModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(
        JudgmentScientist $judgmentScientistModel,
        NarratorScientistSay $narratorScientistSayModel
    ) {
        $this->judgmentScientistModel = $judgmentScientistModel;
        $this->narratorScientistSayModel = $narratorScientistSayModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $scientistId = (int) $request->input('sci', 0);
        $query = trim((string) $request->input('q', ''));

        $scientists = $this->judgmentScientistModel->newQuery()
            ->select(['ID', 'Name'])
            ->limit(50)
            ->get()
            ->map(fn (JudgmentScientist $s) => [
                'ID' => $s->ID,
                'Name' => $s->Name,
            ])
            ->toArray();

        $results = [];

        if ($scientistId > 0) {
            $queryBuilder = $this->narratorScientistSayModel->newQuery()
                ->where('NScientistID', $scientistId)
                ->with(['narrator']);

            if ($query !== '') {
                $queryBuilder->whereHas('narrator', function ($q) use ($query) {
                    $q->whereRaw('normalize_arabic(Name) LIKE normalize_arabic(?)', ['%'.$query.'%']);
                });
            }

            $results = $queryBuilder
                ->limit(50)
                ->get();
        }

        return $this->jsonResponse([
            'scientists' => $scientists,
            'results' => ScholarOpinionResource::collection($results),
        ]);
    }
}
