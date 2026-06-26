<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use App\Models\TransmissionChain;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetTransmissionChainController extends Controller
{
    private TransmissionChain $chainModel;

    private Narrator $narratorModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(TransmissionChain $chainModel, Narrator $narratorModel)
    {
        $this->chainModel = $chainModel;
        $this->narratorModel = $narratorModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $sanadId = (int) $request->input('sanad_id');
        if ($sanadId <= 0) {
            return $this->errorResponse('Invalid Sanad ID', 400);
        }

        /** @var TransmissionChain|null $chain */
        $chain = $this->chainModel->newQuery()
            ->where('ID', $sanadId)
            ->first();

        if (! $chain) {
            return $this->errorResponse('Sanad chain not found', 404);
        }

        $narratorIds = $chain->getNarratorIds();
        if ($narratorIds === []) {
            return $this->jsonResponse([
                'sanad_id' => $sanadId,
                'narrators' => [],
            ]);
        }

        $narrators = $this->narratorModel->newQuery()
            ->whereIn('ID', $narratorIds)
            ->get();

        $narratorMap = $narrators->keyBy('ID');

        $orderedNarrators = [];
        foreach ($narratorIds as $nid) {
            if ($narratorMap->has($nid)) {
                /** @var Narrator $n */
                $n = $narratorMap->get($nid);
                $orderedNarrators[] = [
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
                $orderedNarrators[] = [
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
            'sanad_id' => $sanadId,
            'narrators' => $orderedNarrators,
        ]);
    }
}
