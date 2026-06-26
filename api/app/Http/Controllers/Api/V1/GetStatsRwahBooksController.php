<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatsRwahBooksResource;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetStatsRwahBooksController extends Controller
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
        $book1 = (int) $request->input('book1', 0);
        $book2 = (int) $request->input('book2', 0);

        $overlapCount = 0;

        if ($book1 > 0 && $book2 > 0) {
            $connection = $this->narratorModel->getConnection();
            $result = $connection->selectOne('
                SELECT COUNT(DISTINCT nb1.RawyID) as count
                FROM nounsbooks nb1
                JOIN nounsbooks nb2 ON nb1.RawyID = nb2.RawyID
                WHERE nb1.BookID = ? AND nb2.BookID = ?
            ', [$book1, $book2]);

            if ($result !== null) {
                $row = (array) $result;
                $overlapCount = (int) ($row['count'] ?? 0);
            }
        }

        return $this->jsonResponse(
            (new StatsRwahBooksResource($overlapCount))->resolve()
        );
    }
}
