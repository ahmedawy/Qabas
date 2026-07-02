<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use App\Models\HadithTakhreej;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetMatnComparisonController extends Controller
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

        $masterHadith = $this->hadithModel->newQuery()
            ->select(['MainID', 'BookID', 'BookName', 'TarqeemMatboa1 as HadithNum', 'CleanContent'])
            ->where('MainID', $id)
            ->first();

        if (!$masterHadith) {
            return $this->errorResponse('Hadith not found', 404);
        }

        $takhreegRow = HadithTakhreej::where('HadithMainID', $id)->first();
        if (!$takhreegRow || !$takhreegRow->GroupID) {
            return $this->jsonResponse([
                'master' => [
                    'main_id' => $masterHadith->MainID,
                    'book_name' => trim((string)$masterHadith->BookName),
                    'hadith_num' => trim((string)$masterHadith->HadithNum),
                    'clean_content' => trim((string)$masterHadith->CleanContent),
                ],
                'slaves' => []
            ]);
        }

        $relatedTakhreej = HadithTakhreej::where('GroupID', $takhreegRow->GroupID)->get();
        $relatedIds = $relatedTakhreej->pluck('HadithMainID')->toArray();

        // Fetch slave hadiths with book metadata
        $slaveHadiths = DB::table('booktoc_hadith')
            ->join('hadith_books', 'booktoc_hadith.BookID', '=', 'hadith_books.ID')
            ->whereIn('booktoc_hadith.MainID', $relatedIds)
            ->select(
                'booktoc_hadith.MainID',
                'booktoc_hadith.BookID',
                'booktoc_hadith.BookName',
                'booktoc_hadith.TarqeemMatboa1 as HadithNum',
                'booktoc_hadith.CleanContent',
                'hadith_books.Tarteeb'
            )
            ->get()
            ->keyBy('MainID');

        // Group by BookID to bulk fetch wording comparisons
        $bookGroups = [];
        foreach ($slaveHadiths as $hData) {
            $bookGroups[$hData->BookID][] = $hData->MainID;
        }

        // Bulk fetch comments and match scores
        $comparisonsByRelatedId = [];
        foreach ($bookGroups as $bookId => $bookRelatedIds) {
            try {
                $comparisonTable = "hmatncomparison{$bookId}";
                $comps = DB::table($comparisonTable)
                    ->where(function($q) use ($id, $bookRelatedIds) {
                        $q->where('MasterMatnID', $id)->whereIn('SlaveMatnID', $bookRelatedIds);
                    })
                    ->orWhere(function($q) use ($id, $bookRelatedIds) {
                        $q->where('SlaveMatnID', $id)->whereIn('MasterMatnID', $bookRelatedIds);
                    })
                    ->get();

                foreach ($comps as $comp) {
                    $slaveId = ($comp->SlaveMatnID == $id) ? $comp->MasterMatnID : $comp->SlaveMatnID;
                    $comparisonsByRelatedId[$slaveId] = [
                        'comment' => trim((string)$comp->Comment),
                        'match_sort' => (int)($comp->MatchSort ?? 9999)
                    ];
                }
            } catch (\Exception $e) {
                // Ignore missing tables
            }
        }

        $slaves = [];
        foreach ($slaveHadiths as $relatedId => $hadith) {
            // Exclude the master hadith itself from the slave list
            if ($relatedId === $id) {
                continue;
            }

            $compData = $comparisonsByRelatedId[$relatedId] ?? ['comment' => null, 'match_sort' => 9999];
            if (empty($compData['comment'])) {
                continue;
            }
            $cleanContent = trim((string)$hadith->CleanContent);

            $slaves[] = [
                'main_id' => $relatedId,
                'book_name' => trim((string)$hadith->BookName),
                'hadith_num' => trim((string)$hadith->HadithNum),
                'clean_content' => $cleanContent,
                'content_length' => mb_strlen($cleanContent),
                'tarteeb' => (int)$hadith->Tarteeb,
                'match_sort' => $compData['match_sort'],
                'comparison_comment' => $compData['comment']
            ];
        }

        return $this->jsonResponse([
            'master' => [
                'main_id' => $masterHadith->MainID,
                'book_name' => trim((string)$masterHadith->BookName),
                'hadith_num' => trim((string)$masterHadith->HadithNum),
                'clean_content' => trim((string)$masterHadith->CleanContent),
            ],
            'slaves' => $slaves
        ]);
    }
}
