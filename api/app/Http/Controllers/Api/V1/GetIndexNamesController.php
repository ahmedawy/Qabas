<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use App\Models\BookTocService;
use App\Models\IndexCategory;
use App\Models\IndexItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetIndexNamesController extends Controller
{
    private IndexCategory $categoryModel;

    private IndexItem $itemModel;

    private BookTocHadith $hadithModel;

    private BookTocService $serviceModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(
        IndexCategory $categoryModel,
        IndexItem $itemModel,
        BookTocHadith $hadithModel,
        BookTocService $serviceModel
    ) {
        $this->categoryModel = $categoryModel;
        $this->itemModel = $itemModel;
        $this->hadithModel = $hadithModel;
        $this->serviceModel = $serviceModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $categoryId = $request->input('category_id');
        $itemId = $request->input('item_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return hadiths and services referencing a specific Name Index Item
        if ($itemId !== null) {
            $id = (int) $itemId;
            $item = $this->itemModel->newQuery()->find($id);

            if ($item === null) {
                return $this->errorResponse('Index item not found', 404);
            }

            $category = $this->categoryModel->newQuery()->find($item->getAttribute('IndexID'));
            $tag = ($category instanceof IndexCategory) ? (string) $category->getAttribute('Tag') : 'علم_رجل';

            // Query hadiths containing this tag with the item ID
            $hadiths = $this->hadithModel->newQuery()
                ->whereIn('MainID', function ($q) use ($tag, $id) {
                    $q->select('source_id')
                      ->from('annotation_links')
                      ->where('source_table', 'booktoc_hadith')
                      ->where('tag_type', $tag)
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

            // Query services containing this tag with the item ID
            $services = $this->serviceModel->newQuery()
                ->whereIn('MainID', function ($q) use ($tag, $id) {
                    $q->select('source_id')
                      ->from('annotation_links')
                      ->where('source_table', 'booktoc_services')
                      ->where('tag_type', $tag)
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

        // Case 2: Browse items for a subcategory or search names
        if ($categoryId !== null) {
            $catId = (int) $categoryId;
            $queryBuilder = $this->itemModel->newQuery()
                ->where('IndexID', $catId);

            if ($query !== '') {
                $queryBuilder->whereRaw('normalize_arabic(Title) LIKE normalize_arabic(?)', ['%'.$query.'%']);
            }

            $items = $queryBuilder
                ->orderBy('ID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'items' => $items->items(),
                'next_cursor' => $items->nextCursor() ? $items->nextCursor()->encode() : null,
            ]);
        }

        // Case 3: Search all names categories if query is provided but no category_id
        if ($query !== '') {
            $nameCategoryIds = $this->categoryModel->newQuery()
                ->where('ParentID', 3)
                ->pluck('ID')
                ->toArray();

            $items = $this->itemModel->newQuery()
                ->whereIn('IndexID', $nameCategoryIds)
                ->whereRaw('normalize_arabic(Title) LIKE normalize_arabic(?)', ['%'.$query.'%'])
                ->orderBy('ID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'items' => $items->items(),
                'next_cursor' => $items->nextCursor() ? $items->nextCursor()->encode() : null,
            ]);
        }

        // Case 4: Default subcategories of category 3 (Names)
        $subcategories = $this->categoryModel->newQuery()
            ->where('ParentID', 3)
            ->get();

        return $this->jsonResponse([
            'subcategories' => $subcategories->toArray(),
        ]);
    }
}
