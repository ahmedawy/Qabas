<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use App\Models\TransmissionChain;
use App\Models\AsanedHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetCombinedTakhreejChainController extends Controller
{
    private TransmissionChain $chainModel;
    private Narrator $narratorModel;
    private AsanedHadith $asanedHadithModel;

    public function __construct(TransmissionChain $chainModel, Narrator $narratorModel, AsanedHadith $asanedHadithModel)
    {
        $this->chainModel = $chainModel;
        $this->narratorModel = $narratorModel;
        $this->asanedHadithModel = $asanedHadithModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $hadithIds = $request->input('hadith_ids');
        if (!is_array($hadithIds) || empty($hadithIds)) {
            return $this->errorResponse('Invalid or empty hadith_ids array', 400);
        }

        $hadithIds = array_map('intval', $hadithIds);

        // Find all SanadIDs associated with these hadithIds
        $sanadIds = $this->asanedHadithModel->newQuery()
            ->whereIn('HadithMainID', $hadithIds)
            ->pluck('SanadID')
            ->unique()
            ->toArray();

        if (empty($sanadIds)) {
            return $this->jsonResponse([
                'nodes' => [],
                'edges' => [],
            ]);
        }

        $chains = $this->chainModel->newQuery()
            ->whereIn('ID', $sanadIds)
            ->get();

        if ($chains->isEmpty()) {
            return $this->jsonResponse([
                'nodes' => [],
                'edges' => [],
            ]);
        }

        $allNarratorIds = [];
        $edges = [];

        foreach ($chains as $chain) {
            $narratorIds = $chain->getNarratorIds();
            if (empty($narratorIds)) {
                continue;
            }

            foreach ($narratorIds as $nid) {
                $allNarratorIds[] = $nid;
            }

            // Create edges from narrator A to narrator B (chain flows right-to-left chronologically)
            for ($i = 0; $i < count($narratorIds) - 1; $i++) {
                $source = (string) $narratorIds[$i];
                $target = (string) $narratorIds[$i + 1];
                $edgeId = "{$source}-{$target}";
                $edges[$edgeId] = [
                    'id' => $edgeId,
                    'source' => $source,
                    'target' => $target,
                ];
            }
        }

        $uniqueNarratorIds = array_values(array_unique($allNarratorIds));

        if (empty($uniqueNarratorIds)) {
            return $this->jsonResponse([
                'nodes' => [],
                'edges' => [],
            ]);
        }

        $narrators = $this->narratorModel->newQuery()
            ->select(['ID', 'Name', 'AbbName', 'EsmShuhra', 'Kunia', 'Laqab', 'Nasab', 'Tabaqa', 'DeathYear', 'MartabaIbnHajar'])
            ->whereIn('ID', $uniqueNarratorIds)
            ->get();

        $narratorMap = $narrators->keyBy('ID');

        $nodes = [];
        foreach ($uniqueNarratorIds as $nid) {
            if ($narratorMap->has($nid)) {
                /** @var Narrator $n */
                $n = $narratorMap->get($nid);
                $nodes[] = [
                    'id' => (string) $n->ID,
                    'ID' => $n->ID,
                    'Name' => $n->Name,
                    'AbbName' => $n->AbbName ?? '',
                    'EsmShuhra' => $n->EsmShuhra ?? '',
                    'Kunia' => $n->Kunia ?? '',
                    'Laqab' => $n->Laqab ?? '',
                    'Nasab' => $n->Nasab ?? '',
                    'Tabaqa' => $n->Tabaqa ?? '',
                    'DeathYear' => $n->DeathYear ?? '',
                    'MartabaIbnHajar' => $n->MartabaIbnHajar ?? '',
                ];
            } else {
                $nodes[] = [
                    'id' => (string) $nid,
                    'ID' => $nid,
                    'Name' => '[راوٍ غير معرف في قاعدة البيانات]',
                    'AbbName' => '',
                    'EsmShuhra' => '',
                    'Kunia' => '',
                    'Laqab' => '',
                    'Nasab' => '',
                    'Tabaqa' => '',
                    'DeathYear' => '',
                    'MartabaIbnHajar' => '',
                ];
            }
        }

        return $this->jsonResponse([
            'nodes' => $nodes,
            'edges' => array_values($edges),
        ]);
    }
}
