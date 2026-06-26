<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatsAtrafResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetStatsAtrafController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(BookTocHadith $hadithModel)
    {
        $this->hadithModel = $hadithModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $connection = $this->hadithModel->getConnection();

        $results = $connection->select('
            SELECT BookName, COUNT(*) as Count 
            FROM booktoc_hadith 
            WHERE IsLeaf = 1 
            GROUP BY BookID, BookName
            ORDER BY Count DESC 
            LIMIT 15
        ');

        return $this->jsonResponse([
            'stats' => StatsAtrafResource::collection($results),
        ]);
    }
}
