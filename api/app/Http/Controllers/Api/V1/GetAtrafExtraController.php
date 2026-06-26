<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AtrafExtraResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetAtrafExtraController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(BookTocHadith $hadithModel)
    {
        $this->hadithModel = $hadithModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $src = (int) $request->input('src', 0);
        $tgt = (int) $request->input('tgt', 0);

        // Whitelist: only valid primary Hadith book IDs (1–62) are accepted.
        // This prevents SQL injection via dynamic table name interpolation.
        if ($src < 1 || $src > 62 || $tgt < 1 || $tgt > 62) {
            return $this->errorResponse('Invalid Source or Target Book ID', 400);
        }

        $connection = $this->hadithModel->getConnection();
        $compTable = 'hmatncomparison'.$src;
        $tableExists = false;

        try {
            // Check if table exists in database to avoid SQL error
            // Escaping table name with backticks safely in dynamic SQL
            $connection->select("SELECT 1 FROM `{$compTable}` LIMIT 1");
            $tableExists = true;
        } catch (\Exception $e) {
            $tableExists = false;
        }

        if (! $tableExists) {
            return $this->jsonResponse([
                'results' => [],
            ]);
        }

        // Fetch parallel comparison texts matching book IDs
        $results = $this->hadithModel->newQuery()
            ->join($compTable.' as mc', 'booktoc_hadith.MainID', '=', 'mc.MasterMatnID')
            ->join('booktoc_hadith as bh2', 'mc.SlaveMatnID', '=', 'bh2.MainID')
            ->where('booktoc_hadith.BookID', $src)
            ->where('bh2.BookID', $tgt)
            ->where('booktoc_hadith.IsLeaf', 1)
            ->select([
                'booktoc_hadith.MainID',
                'booktoc_hadith.Tarf as Title',
                'booktoc_hadith.CleanContent as SrcCleanContent',
                'booktoc_hadith.Annotations as SrcAnnotations',
                'bh2.CleanContent as TgtCleanContent',
                'bh2.Annotations as TgtAnnotations',
            ])
            ->limit(50)
            ->get();

        return $this->jsonResponse([
            'results' => AtrafExtraResource::collection($results),
        ]);
    }
}
