<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use App\Models\TransmissionChain;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetCombinedTransmissionChainController extends Controller
{
    private TransmissionChain $chainModel;
    private Narrator $narratorModel;

    public function __construct(TransmissionChain $chainModel, Narrator $narratorModel)
    {
        $this->chainModel = $chainModel;
        $this->narratorModel = $narratorModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $sanadIds = $request->input('sanad_ids');
        if (!is_array($sanadIds) || empty($sanadIds)) {
            return $this->errorResponse('Invalid or empty sanad_ids array', 400);
        }

        $sanadIds = array_map('intval', $sanadIds);

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
            // Let's create edges between consecutive narrators in the chain.
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
