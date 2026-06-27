<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithJudgmentResource;
use App\Models\BookTocHadith;
use App\Models\HadithJudgmentHit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithJudgmentsController extends Controller
{
    private BookTocHadith $hadithModel;
    private HadithJudgmentHit $judgmentModel;

    public function __construct(
        BookTocHadith $hadithModel,
        HadithJudgmentHit $judgmentModel
    ) {
        $this->hadithModel = $hadithModel;
        $this->judgmentModel = $judgmentModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hadith = $this->hadithModel->newQuery()
            ->where('MainID', $id)
            ->first();

        if (! $hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        // Fetch authenticity judgments, eager loading relations
        $judgments = $this->judgmentModel->newQuery()
            ->where('HadithMainID', $id)
            ->with(['say.scholar'])
            ->get();

        return $this->jsonResponse([
            'book_name' => $hadith->BookName,
            'hadith_num' => $hadith->ID,
            'judgments' => HadithJudgmentResource::collection($judgments),
        ]);
    }
}
