<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AsanedTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAsanedRootsController extends Controller
{
    private AsanedTree $treeModel;

    public function __construct(AsanedTree $treeModel)
    {
        $this->treeModel = $treeModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->input('q', ''));
        $sanadType = trim((string) $request->input('sanad_type', ''));

        $queryBuilder = $this->treeModel->newQuery()
            ->where('ParentID', 0);

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Name) LIKE normalize_arabic(?)', ['%' . $query . '%']);
        }

        if ($sanadType === 'marfoa') {
            $queryBuilder->where('isMarfoa', 1);
        } elseif ($sanadType === 'mawkof') {
            $queryBuilder->where('isMawkof', 1);
        } elseif ($sanadType === 'maktoa') {
            $queryBuilder->where('isMaktoa', 1);
        } elseif ($sanadType === 'marfoa_hokm') {
            $queryBuilder->where('isMarfoaHokm', 1);
        }

        $perPage = max(1, min(100, (int) $request->input('per_page', 30)));
        $page = max(1, (int) $request->input('page', 1));

        $paginator = $queryBuilder
            ->orderBy('ID', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        $mapped = collect($paginator->items())->map(fn (AsanedTree $node) => [
            'ID' => $node->ID,
            'Name' => $node->Name,
            'RawyID' => $node->RawyID,
            'IsLeaf' => $node->IsLeaf,
            'isMarfoa' => $node->isMarfoa,
            'isMawkof' => $node->isMawkof,
            'isMaktoa' => $node->isMaktoa,
            'isMarfoaHokm' => $node->isMarfoaHokm,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
