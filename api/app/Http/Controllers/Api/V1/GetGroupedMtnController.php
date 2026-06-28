<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CompoundMatnResource;
use App\Http\Resources\GroupedHadithResource;
use App\Models\BookTocHadith;
use App\Models\CompoundMatn;
use App\Models\MatnGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetGroupedMtnController extends Controller
{
    private CompoundMatn $compoundMatnModel;

    private MatnGroup $matnGroupModel;

    private BookTocHadith $hadithModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(
        CompoundMatn $compoundMatnModel,
        MatnGroup $matnGroupModel,
        BookTocHadith $hadithModel
    ) {
        $this->compoundMatnModel = $compoundMatnModel;
        $this->matnGroupModel = $matnGroupModel;
        $this->hadithModel = $hadithModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));
        $hadithMainId = $request->input('hadith_main_id');

        // Case 1: Resolve parallel group for a specific HadithMainID
        if ($hadithMainId !== null) {
            $mainId = (int) $hadithMainId;

            // Find the group(s) this hadith belongs to
            $groupIds = $this->matnGroupModel->newQuery()
                ->where('HadithMainID', $mainId)
                ->pluck('GroupID')
                ->filter()
                ->unique()
                ->toArray();

            if (empty($groupIds)) {
                return $this->jsonResponse([
                    'group_hadiths' => [],
                ]);
            }

            // Find all Hadiths in these groups
            $groupHadiths = $this->hadithModel->newQuery()
                ->join('hgamhalmatn as gm', 'booktoc_hadith.MainID', '=', 'gm.HadithMainID')
                ->whereIn('gm.GroupID', $groupIds)
                ->where('booktoc_hadith.MainID', '!=', $mainId) // Exclude the current hadith
                ->select([
                    'booktoc_hadith.MainID',
                    'booktoc_hadith.BookName',
                    'booktoc_hadith.ID as HadithNum',
                    'booktoc_hadith.PartNum',
                    'booktoc_hadith.PageNum',
                    'booktoc_hadith.Tarf as Title',
                    'booktoc_hadith.CleanContent as CleanContent',
                    'booktoc_hadith.Annotations as Annotations',
                    'booktoc_hadith.ServiceFlags as ServiceFlags',
                ])
                ->distinct()
                ->get();

            return $this->jsonResponse([
                'group_hadiths' => GroupedHadithResource::collection($groupHadiths),
            ]);
        }

        // Case 2: Search compound matns
        $queryBuilder = $this->compoundMatnModel->newQuery()
            ->join('booktoc_hadith as h', 'hcompoundmatn.HadithMainID', '=', 'h.MainID')
            ->select([
                'hcompoundmatn.ID as ID',
                'hcompoundmatn.HadithMainID as HadithMainID',
                'hcompoundmatn.CleanMatn as CleanMatn',
                'hcompoundmatn.MatnAnnotations as MatnAnnotations',
                'hcompoundmatn.AsanedComp as AsanedComp',
                'h.BookName as BookName',
                'h.ID as HadithNum',
            ]);

        if ($query !== '') {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$query])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            $matchQuery = implode('* ', $words) . '*';

            $queryBuilder->whereRaw('MATCH(hcompoundmatn.CleanMatn_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery]);
        }

        $results = $queryBuilder
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => CompoundMatnResource::collection($results),
        ]);
    }
}
