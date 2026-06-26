<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetNarratorClassificationsController extends Controller
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
        $tabaqat = $this->narratorModel->newQuery()
            ->whereNotNull('Tabaqa')
            ->where('Tabaqa', '!=', '')
            ->where('Tabaqa', '!=', '-')
            ->orderBy('TabaqaNum')
            ->distinct()
            ->limit(30)
            ->pluck('Tabaqa')
            ->toArray();

        $cities = $this->narratorModel->newQuery()
            ->whereNotNull('LivingCity')
            ->where('LivingCity', '!=', '')
            ->where('LivingCity', '!=', '-')
            ->distinct()
            ->limit(30)
            ->pluck('LivingCity')
            ->toArray();

        $cat = trim((string) $request->input('cat', ''));
        $val = trim((string) $request->input('val', ''));
        $results = [];

        if ($cat !== '' && $val !== '') {
            $allowedCats = ['Tabaqa', 'LivingCity', 'Mazhb'];
            if (in_array($cat, $allowedCats, true)) {
                $rawResults = $this->narratorModel->newQuery()
                    ->where($cat, $val)
                    ->where('IsRawy', 1)
                    ->limit(50)
                    ->get();

                $results = $rawResults->map(fn (Narrator $n) => [
                    'ID' => $n->ID,
                    'Name' => $n->Name,
                    'DeathYear' => $n->DeathYear,
                    'Tabaqa' => $n->Tabaqa,
                    'City' => $n->LivingCity,
                ])->toArray();
            }
        }

        return $this->jsonResponse([
            'tabaqat' => $tabaqat,
            'cities' => $cities,
            'results' => $results,
        ]);
    }
}
