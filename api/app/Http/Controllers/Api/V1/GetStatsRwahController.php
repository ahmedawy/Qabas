<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetStatsRwahController extends Controller
{
    private Narrator $narratorModel;

    /**
     * Inject constructor dependencies.
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
        // Single conditional-aggregation query instead of 4 separate COUNT(*) round-trips
        $connection = $this->narratorModel->getConnection();
        $row = $connection->selectOne('
            SELECT
                COUNT(*) as total,
                SUM(TabaqaNum = 1) as sahaba,
                SUM(MartabaIbnHajar LIKE ? OR MartabaZahabi LIKE ?) as thiqa,
                SUM(MartabaIbnHajar LIKE ? OR MartabaIbnHajar LIKE ?) as doafa
            FROM nouns
            WHERE IsRawy = 1
        ', ['%ثقة%', '%ثقة%', '%ضعيف%', '%متروك%']);

        $data = $row !== null ? (array) $row : [];

        return $this->jsonResponse([
            'total' => (int) ($data['total'] ?? 0),
            'sahaba' => (int) ($data['sahaba'] ?? 0),
            'thiqa' => (int) ($data['thiqa'] ?? 0),
            'doafa' => (int) ($data['doafa'] ?? 0),
        ]);
    }
}
