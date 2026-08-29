<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AsanedTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAsanedChildrenController extends Controller
{
    private AsanedTree $treeModel;

    public function __construct(AsanedTree $treeModel)
    {
        $this->treeModel = $treeModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $parentId = (int) $request->input('parent_id', 0);

        if ($parentId <= 0) {
            return $this->jsonResponse([
                'results' => [],
            ]);
        }

        $children = $this->treeModel->newQuery()
            ->where('ParentID', $parentId)
            ->orderBy('ID', 'asc')
            ->get();

        $mapped = $children->map(fn (AsanedTree $node) => [
            'ID' => $node->ID,
            'Name' => $node->Name,
            'ParentID' => $node->ParentID,
            'RawyID' => $node->RawyID,
            'IsLeaf' => $node->IsLeaf,
            'isMarfoa' => $node->isMarfoa,
            'isMawkof' => $node->isMawkof,
            'isMaktoa' => $node->isMaktoa,
            'isMarfoaHokm' => $node->isMarfoaHokm,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
        ]);
    }
}
