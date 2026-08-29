<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AsanedTree;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetAsanedHadithsController extends Controller
{
    private AsanedTree $treeModel;
    private BookTocHadith $hadithModel;

    public function __construct(AsanedTree $treeModel, BookTocHadith $hadithModel)
    {
        $this->treeModel = $treeModel;
        $this->hadithModel = $hadithModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $treeId = (int) $request->input('tree_id', 0);
        $rawyPathInput = trim((string) $request->input('rawy_path', ''));

        $rawyIds = [];

        if ($treeId > 0) {
            // Traverse up the tree to build the RawyID chain
            $currentId = $treeId;
            while ($currentId > 0) {
                $node = DB::table('asanedtree')
                    ->select('ID', 'ParentID', 'RawyID')
                    ->where('ID', $currentId)
                    ->first();

                if (! $node) {
                    break;
                }

                if ($node->RawyID !== null && $node->RawyID > 0) {
                    array_unshift($rawyIds, (int) $node->RawyID);
                }

                if ($node->ParentID == 0) {
                    break;
                }

                $currentId = (int) $node->ParentID;
            }
        } elseif ($rawyPathInput !== '') {
            $rawyIds = array_filter(array_map('intval', explode(',', $rawyPathInput)));
        }

        if (empty($rawyIds)) {
            return $this->jsonResponse([
                'results' => [],
                'chain_path' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }

        // Construct pattern for SandRwah matching
        // SandRwah is space-delimited IDs e.g. " 6 13809 16903 2594 "
        $pattern = implode(' ', $rawyIds);

        // Step 1: Find matching Sanad IDs fast
        $sanadIds = DB::table('asaned')
            ->where('SandRwah', 'LIKE', '%' . $pattern . '%')
            ->pluck('ID')
            ->toArray();

        if (empty($sanadIds)) {
            return $this->jsonResponse([
                'results' => [],
                'chain_path' => $rawyIds,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }

        // Step 2: Find distinct HadithMainIDs linked to these SanadIDs
        $hadithMainIds = DB::table('asanedhadiths')
            ->whereIn('SanadID', $sanadIds)
            ->distinct()
            ->pluck('HadithMainID')
            ->toArray();

        if (empty($hadithMainIds)) {
            return $this->jsonResponse([
                'results' => [],
                'chain_path' => $rawyIds,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
            ]);
        }

        // Step 3: Build paginated query on booktoc_hadith
        $queryBuilder = $this->hadithModel->newQuery()
            ->select('booktoc_hadith.*')
            ->where('booktoc_hadith.IsLeaf', 1)
            ->whereIn('booktoc_hadith.MainID', $hadithMainIds);

        $booksRaw = trim((string) $request->input('books', ''));
        if ($booksRaw !== '') {
            $bookIds = array_map('intval', explode(',', $booksRaw));
            $queryBuilder->whereIn('booktoc_hadith.BookID', $bookIds);
        }

        $perPage = max(1, min(100, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $paginator = $queryBuilder
            ->orderBy('booktoc_hadith.BookID', 'asc')
            ->orderBy('booktoc_hadith.ID', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        $mapped = collect($paginator->items())->map(fn (BookTocHadith $h) => [
            'MainID' => $h->MainID,
            'Text' => $h->Tarf ?? $h->Title,
            'CleanContent' => $h->CleanContent,
            'BookName' => $h->BookName,
            'HadithNum' => $h->ID,
            'PartNum' => $h->PartNum,
            'PageNum' => $h->PageNum,
        ]);

        return $this->jsonResponse([
            'results' => $mapped->toArray(),
            'chain_path' => $rawyIds,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }
}
