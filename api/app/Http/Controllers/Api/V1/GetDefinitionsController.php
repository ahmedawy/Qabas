<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExpressionSay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetDefinitionsController extends Controller
{
    private ExpressionSay $expressionSayModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(ExpressionSay $expressionSayModel)
    {
        $this->expressionSayModel = $expressionSayModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $nodeId = $request->input('node_id');

        if ($nodeId === null) {
            return $this->jsonResponse([
                'definitions' => [],
            ]);
        }

        $nid = (int) $nodeId;

        $results = $this->expressionSayModel->newQuery()
            ->leftJoin('nouns as n', 'hadithexpressionssays.ScientistID', '=', 'n.ID')
            ->leftJoin('booktoc_services as s', 'hadithexpressionssays.ServiceMainID', '=', 's.MainID')
            ->where('hadithexpressionssays.NodeID', $nid)
            ->select([
                'hadithexpressionssays.Say as Say',
                'n.Name as ScholarName',
                's.BookName as BookName',
                's.ID as HadithNum',
                's.PartNum as PartNum',
                's.PageNum as PageNum',
                'hadithexpressionssays.ServiceMainID as ServiceMainID',
            ])
            ->get();

        return $this->jsonResponse([
            'definitions' => $results->toArray(),
        ]);
    }
}
