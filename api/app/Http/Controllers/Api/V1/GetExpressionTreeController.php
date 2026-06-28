<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExpressionNode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetExpressionTreeController extends Controller
{
    private ExpressionNode $expressionNodeModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(ExpressionNode $expressionNodeModel)
    {
        $this->expressionNodeModel = $expressionNodeModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $parentId = $request->input('parent_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Search term tree by query
        if ($query !== '') {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$query])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            $matchQuery = implode('* ', $words) . '*';

            $nodes = $this->expressionNodeModel->newQuery()
                ->whereRaw('MATCH(Text_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery])
                ->limit(100)
                ->get();

            return $this->jsonResponse([
                'nodes' => $nodes->toArray(),
            ]);
        }

        // Case 2: Browse children
        $pid = $parentId !== null ? (int) $parentId : 0;
        $nodes = $this->expressionNodeModel->newQuery()
            ->where('ParentID', $pid)
            ->orderBy('ID')
            ->cursorPaginate(50);

        return $this->jsonResponse([
            'nodes' => $nodes->items(),
            'next_cursor' => $nodes->nextCursor() ? $nodes->nextCursor()->encode() : null,
        ]);
    }
}
