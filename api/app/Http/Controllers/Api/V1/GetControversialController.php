<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ControversialDescription;
use App\Models\ControversialNode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetControversialController extends Controller
{
    private ControversialNode $nodeModel;

    private ControversialDescription $descModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(ControversialNode $nodeModel, ControversialDescription $descModel)
    {
        $this->nodeModel = $nodeModel;
        $this->descModel = $descModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $nodeId = $request->input('node_id');
        $parentId = $request->input('parent_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return descriptions/reconciliations for a controversial node
        if ($nodeId !== null) {
            $nid = (int) $nodeId;
            $descriptions = $this->descModel->newQuery()
                ->join('booktoc_services as s', 'hadithcontroverialdescrp.ServiceMainID', '=', 's.MainID')
                ->where('hadithcontroverialdescrp.NodeID', $nid)
                ->select([
                    's.MainID as MainID',
                    's.BookName as BookName',
                    's.ID as HadithNum',
                    's.PartNum as PartNum',
                    's.PageNum as PageNum',
                    's.Tarf as Title',
                    's.CleanContent as CleanContent',
                    's.Annotations as Annotations',
                ])
                ->limit(50)
                ->get();

            return $this->jsonResponse([
                'descriptions' => $descriptions->toArray(),
            ]);
        }

        // Case 2: Search controversial tree by query
        if ($query !== '') {
            $nodes = $this->nodeModel->newQuery()
                ->whereRaw('normalize_arabic(Text) LIKE normalize_arabic(?)', ['%'.$query.'%'])
                ->limit(100)
                ->get();

            return $this->jsonResponse([
                'nodes' => $nodes->toArray(),
            ]);
        }

        // Case 3: Browse child nodes
        $pid = $parentId !== null ? (int) $parentId : 0;
        $nodes = $this->nodeModel->newQuery()
            ->where('ParentID', $pid)
            ->orderBy('ID')
            ->get();

        return $this->jsonResponse([
            'nodes' => $nodes->toArray(),
        ]);
    }
}
