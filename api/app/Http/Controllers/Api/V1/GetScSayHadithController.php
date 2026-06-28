<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HadithJudgmentHit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetScSayHadithController extends Controller
{
    private HadithJudgmentHit $judgmentHitModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(HadithJudgmentHit $judgmentHitModel)
    {
        $this->judgmentHitModel = $judgmentHitModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $hadithMainId = $request->input('hadith_main_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Fetch judgments for a specific Hadith
        if ($hadithMainId !== null) {
            $mainId = (int) $hadithMainId;

            $judgments = $this->judgmentHitModel->newQuery()
                ->join('hadithjudgmentsays as s', 'hadithjudgmenthits.SayID', '=', 's.ID')
                ->join('hadithjudgmentscientists as sc', 's.ScientistID', '=', 'sc.ID')
                ->where('hadithjudgmenthits.HadithMainID', $mainId)
                ->select([
                    'sc.Name as ScholarName',
                    's.Say as JudgmentText',
                ])
                ->get();

            return $this->jsonResponse([
                'judgments' => $judgments->toArray(),
            ]);
        }

        // Case 2: Search hadiths by judgment keyword
        $queryBuilder = $this->judgmentHitModel->newQuery()
            ->join('hadithjudgmentsays as s', 'hadithjudgmenthits.SayID', '=', 's.ID')
            ->join('hadithjudgmentscientists as sc', 's.ScientistID', '=', 'sc.ID')
            ->join('booktoc_hadith as h', 'hadithjudgmenthits.HadithMainID', '=', 'h.MainID')
            ->select([
                'h.MainID as MainID',
                'h.BookName as BookName',
                'h.ID as HadithNum',
                'h.Tarf as Title',
                'h.ServiceFlags as ServiceFlags',
                'sc.Name as ScholarName',
                's.Say as JudgmentText',
            ]);

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(s.Say) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => $results->toArray(),
        ]);
    }
}
