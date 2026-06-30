<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use App\Models\HadithTakhreej;
use App\Models\HadithShawahed;
use App\Models\CompoundMatn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithTakhreejController extends Controller
{
    private BookTocHadith $hadithModel;

    public function __construct(BookTocHadith $hadithModel)
    {
        $this->hadithModel = $hadithModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hadith = $this->hadithModel->newQuery()
            ->select(['MainID', 'BookID', 'BookName', 'ID'])
            ->where('MainID', $id)
            ->first();

        if (! $hadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        // 1. Fetch Takhreej cross-references
        $takhreejList = [];
        $takhreegRow = HadithTakhreej::where('HadithMainID', $id)->first();
        if ($takhreegRow && $takhreegRow->GroupID) {
            $takhreejList = HadithTakhreej::where('GroupID', $takhreegRow->GroupID)
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
        $hasShawahed = HadithShawahed::where('HadithMainID', $id)->exists();
        $comparisons = [];
        $bookId = $hadith->BookID;
        if ($hasShawahed && $bookId > 0) {
            $comparisons = DB::table("hmatncomparison{$bookId}")
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
        $compoundMatn = CompoundMatn::where('HadithMainID', $id)->first();

        return $this->jsonResponse([
            'book_name' => $hadith->BookName,
            'hadith_num' => $hadith->ID,
            'book_id' => $hadith->BookID,
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
