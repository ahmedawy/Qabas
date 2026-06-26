<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithByNumberController extends Controller
{
    private BookTocHadith $hadithModel;

    /**
     * Inject model.
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
        $bookId = (int) $request->input('book_id');
        $num = $request->input('num');
        $tarqeem = $request->input('tarqeem', 'ID');

        if ($bookId <= 0 || $num === null || $num === '') {
            return $this->errorResponse('Invalid parameters: book_id and num are required', 400);
        }

        // Whitelist allowed columns to prevent SQL injection
        $allowedCols = ['ID', 'TarqeemHarf', 'TarqeemMatboa1', 'TarqeemMatboa2'];
        $column = in_array($tarqeem, $allowedCols, true) ? $tarqeem : 'ID';

        $hadith = $this->hadithModel->newQuery()
            ->where('BookID', $bookId)
            ->where($column, $num)
            ->where('IsLeaf', 1)
            ->first();

        if (! $hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        return $this->jsonResponse([
            'hadith' => new HadithSummaryResource($hadith),
        ]);
    }
}
