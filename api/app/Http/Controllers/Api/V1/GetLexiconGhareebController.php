<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LexiconDescription;
use App\Models\LexiconItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetLexiconGhareebController extends Controller
{
    private LexiconItem $lexiconItemModel;

    private LexiconDescription $lexiconDescModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(LexiconItem $lexiconItemModel, LexiconDescription $lexiconDescModel)
    {
        $this->lexiconItemModel = $lexiconItemModel;
        $this->lexiconDescModel = $lexiconDescModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $itemId = $request->input('item_id');
        $parentId = $request->input('parent_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return definitions/descriptions for a lexicon term
        if ($itemId !== null) {
            $id = (int) $itemId;
            $descriptions = $this->lexiconDescModel->newQuery()
                ->join('booktoc_services as s', 'lexicondescrp.DescrpMainID', '=', 's.MainID')
                ->where('lexicondescrp.LexiconItemID', $id)
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
                ->orderBy('s.MainID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'descriptions' => $descriptions->items(),
                'next_cursor' => $descriptions->nextCursor() ? $descriptions->nextCursor()->encode() : null,
            ]);
        }

        if ($query !== '') {
            $items = $this->lexiconItemModel->newQuery()
                ->select(['ID', 'Text', 'LexiconID', 'ParentID'])
                ->where('LexiconID', 1)
                ->whereRaw('normalize_arabic(Text) LIKE normalize_arabic(?)', ['%'.$query.'%'])
                ->limit(100)
                ->get();

            return $this->jsonResponse([
                'items' => $items->toArray(),
            ]);
        }

        // Case 3: Browse children
        $pid = $parentId !== null ? (int) $parentId : 0;

        $items = $this->lexiconItemModel->newQuery()
            ->select(['ID', 'Text', 'LexiconID', 'ParentID'])
            ->where('LexiconID', 1)
            ->where('ParentID', $pid)
            ->orderBy('ID')
            ->cursorPaginate(50);

        return $this->jsonResponse([
            'items' => $items->items(),
            'next_cursor' => $items->nextCursor() ? $items->nextCursor()->encode() : null,
        ]);
    }
}
