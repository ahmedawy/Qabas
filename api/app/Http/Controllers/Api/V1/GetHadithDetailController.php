<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BreadcrumbResource;
use App\Http\Resources\ChainResource;
use App\Http\Resources\HadithDetailResource;
use App\Http\Resources\HadithJudgmentResource;
use App\Models\AsanedHadith;
use App\Models\BookTocHadith;
use App\Models\HadithJudgmentHit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithDetailController extends Controller
{
    private BookTocHadith $hadithModel;

    private HadithJudgmentHit $judgmentModel;

    private AsanedHadith $asanedHadithModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(
        BookTocHadith $hadithModel,
        HadithJudgmentHit $judgmentModel,
        AsanedHadith $asanedHadithModel
    ) {
        $this->hadithModel = $hadithModel;
        $this->judgmentModel = $judgmentModel;
        $this->asanedHadithModel = $asanedHadithModel;
    }

    /**
     * Handle the incoming request.
     */
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

        // Fetch hierarchical path (adjacency list recursive CTE query)
        if ($hadith->ParentID) {
            $breadcrumbs = \App\Models\BookTocHadith::getAncestors($hadith);
        } else {
            $breadcrumbs = collect();
        }


        // Fetch authenticity judgments, eager loading relations
        $judgments = $this->judgmentModel->newQuery()
            ->where('HadithMainID', $id)
            ->with(['say.scholar'])
            ->get();

        // Fetch available Sanad IDs and chains
        $chains = $this->asanedHadithModel->newQuery()
            ->where('HadithMainID', $id)
            ->with(['chain'])
            ->get();

        // 1. Fetch Takhreej cross-references
        $takhreejList = [];
        $takhreegRow = \App\Models\HadithTakhreej::where('HadithMainID', $id)->first();
        if ($takhreegRow && $takhreegRow->GroupID) {
            $takhreejList = \App\Models\HadithTakhreej::where('GroupID', $takhreegRow->GroupID)
                ->join('booktoc_hadith', 'htakhreeg.HadithMainID', '=', 'booktoc_hadith.MainID')
                ->select(
                    'htakhreeg.HadithMainID',
                    'htakhreeg.BookID',
                    'booktoc_hadith.BookName',
                    'booktoc_hadith.ID as HadithNum',
                    'booktoc_hadith.Tarf',
                    'booktoc_hadith.PartNum',
                    'booktoc_hadith.PageNum'
                )
                ->get();
        }

        // 2. Fetch Motaba'at (Corroborating Chains)
        $hasShawahed = \App\Models\HadithShawahed::where('HadithMainID', $id)->exists();
        $comparisons = [];
        $bookId = $hadith->BookID;
        if ($hasShawahed && $bookId >= 1 && $bookId <= 33) {
            $comparisons = \DB::table("hmatncomparison{$bookId}")
                ->where('MasterMatnID', $id)
                ->join('booktoc_hadith', "hmatncomparison{$bookId}.SlaveMatnID", '=', 'booktoc_hadith.MainID')
                ->select(
                    "hmatncomparison{$bookId}.SlaveMatnID",
                    "hmatncomparison{$bookId}.Comment",
                    "hmatncomparison{$bookId}.MatchSort",
                    'booktoc_hadith.BookID',
                    'booktoc_hadith.BookName',
                    'booktoc_hadith.ID as HadithNum',
                    'booktoc_hadith.Tarf'
                )
                ->get();
        }

        // 3. Fetch Combined Matn (المتون المجمعة)
        $compoundMatn = \App\Models\CompoundMatn::where('HadithMainID', $id)->first();

        return $this->jsonResponse([
            'hadith' => new HadithDetailResource($hadith),
            'breadcrumbs' => BreadcrumbResource::collection($breadcrumbs),
            'judgments' => HadithJudgmentResource::collection($judgments),
            'chains' => ChainResource::collection($chains),
            'takhreej' => $takhreejList,
            'shawahed' => [
                'has_shawahed' => $hasShawahed,
                'comparisons' => $comparisons,
            ],
            'combined_matn' => $compoundMatn ? [
                'id' => $compoundMatn->ID,
                'clean_matn' => $compoundMatn->CleanMatn,
                'matn_annotations' => $compoundMatn->MatnAnnotations,
                'asaned_comp' => $compoundMatn->AsanedComp,
            ] : null,
        ]);
    }
}
