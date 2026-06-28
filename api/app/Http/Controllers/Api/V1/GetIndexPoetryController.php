<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use App\Models\BookTocService;
use App\Models\IndexItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetIndexPoetryController extends Controller
{
    private IndexItem $itemModel;

    private BookTocHadith $hadithModel;

    private BookTocService $serviceModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(
        IndexItem $itemModel,
        BookTocHadith $hadithModel,
        BookTocService $serviceModel
    ) {
        $this->itemModel = $itemModel;
        $this->hadithModel = $hadithModel;
        $this->serviceModel = $serviceModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $itemId = $request->input('item_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return hadiths and services referencing a specific Poetry Item
        if ($itemId !== null) {
            $id = (int) $itemId;
            $item = $this->itemModel->newQuery()->find($id);

            if ($item === null) {
                return $this->errorResponse('Index item not found', 404);
            }

            // Query hadiths containing poetry tag with this item ID
            $hadiths = $this->hadithModel->newQuery()
                ->whereIn('MainID', function ($q) use ($id) {
                    $q->select('source_id')
                      ->from('annotation_links')
                      ->where('source_table', 'booktoc_hadith')
                      ->where('tag_type', 'شعر')
                      ->where('link_id', $id);
                })
                ->select([
                    'MainID as MainID',
                    'BookName as BookName',
                    'ID as HadithNum',
                    'PartNum as PartNum',
                    'PageNum as PageNum',
                    'Tarf as Title',
                    'CleanContent as CleanContent',
                    'Annotations as Annotations',
                    'ServiceFlags as ServiceFlags',
                ])
                ->limit(30)
                ->get();

            // Query services containing poetry tag with this item ID
            $services = $this->serviceModel->newQuery()
                ->whereIn('MainID', function ($q) use ($id) {
                    $q->select('source_id')
                      ->from('annotation_links')
                      ->where('source_table', 'booktoc_services')
                      ->where('tag_type', 'شعر')
                      ->where('link_id', $id);
                })
                ->select([
                    'MainID as MainID',
                    'BookName as BookName',
                    'ID as HadithNum',
                    'PartNum as PartNum',
                    'PageNum as PageNum',
                    'Tarf as Title',
                    'CleanContent as CleanContent',
                    'Annotations as Annotations',
                ])
                ->limit(30)
                ->get();

            return $this->jsonResponse([
                'item' => $item->toArray(),
                'hadiths' => $hadiths->toArray(),
                'services' => $services->toArray(),
            ]);
        }

        // Case 2: Browse and search poetry items (IndexID = 14)
        $queryBuilder = $this->itemModel->newQuery()
            ->where('IndexID', 14);

        if ($query !== '') {
            $queryBuilder->whereRaw('normalize_arabic(Title) LIKE normalize_arabic(?)', ['%'.$query.'%']);
        }

        $results = $queryBuilder
            ->orderBy('ID')
            ->cursorPaginate(50);

        return $this->jsonResponse([
            'results' => $results->items(),
            'next_cursor' => $results->nextCursor() ? $results->nextCursor()->encode() : null,
        ]);
    }
}
