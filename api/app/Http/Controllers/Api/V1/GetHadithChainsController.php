<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChainResource;
use App\Models\AsanedHadith;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithChainsController extends Controller
{
    private BookTocHadith $hadithModel;
    private AsanedHadith $asanedHadithModel;

    public function __construct(
        BookTocHadith $hadithModel,
        AsanedHadith $asanedHadithModel
    ) {
        $this->hadithModel = $hadithModel;
        $this->asanedHadithModel = $asanedHadithModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hadith = $this->hadithModel->newQuery()
            ->select(['MainID', 'BookName', 'ID'])
            ->where('MainID', $id)
            ->first();

        if (! $hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        // Fetch available Sanad IDs and chains
        $chains = $this->asanedHadithModel->newQuery()
            ->where('HadithMainID', $id)
            ->with(['chain'])
            ->get();

        return $this->jsonResponse([
            'book_name' => $hadith->BookName,
            'hadith_num' => $hadith->ID,
            'chains' => ChainResource::collection($chains),
        ]);
    }
}
