<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GetHadithShawahedController extends Controller
{
    public function __invoke($hadithId)
    {
        $hadith = BookTocHadith::where('MainID', $hadithId)->select('BookID')->first();
        if (!$hadith || !$hadith->BookID) {
            return response()->json(['status' => 'error', 'message' => 'Hadith not found or BookID is missing'], 404);
        }

        $bookId = $hadith->BookID;
        $comparisonTable = "hmatncomparison{$bookId}";
        
        try {
            $shawahedIds = DB::table($comparisonTable)
                ->where('MasterMatnID', $hadithId)
                ->pluck('SlaveMatnID')
                ->toArray();
        } catch (\Exception $e) {
            // Table doesn't exist or other DB error
            $shawahedIds = [];
        }

        if (empty($shawahedIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // Bulk fetch hadiths metadata
        $hadiths = DB::table('booktoc_hadith')
            ->whereIn('MainID', $shawahedIds)
            ->select('MainID', 'BookID', 'BookName', 'PartNum', 'PageNum', 'TarqeemMatboa1')
            ->get();

        // Fetch companions mapping via asaned
        $asanedData = DB::table('asanedhadiths as ah')
            ->join('asaned as a', 'ah.SanadID', '=', 'a.ID')
            ->whereIn('ah.HadithMainID', $shawahedIds)
            ->select('ah.HadithMainID', 'a.SandRwah')
            ->get();

        $companionIds = [];
        $hadithToCompanionId = [];
        
        foreach ($asanedData as $chain) {
            $narrators = explode(' ', trim($chain->SandRwah));
            // First non-empty ID is the companion (or last, depending on direction, but usually first in DB representation)
            $firstNarrator = null;
            foreach ($narrators as $n) {
                if (!empty($n)) {
                    $firstNarrator = (int)$n;
                    break;
                }
            }
            if ($firstNarrator) {
                $companionIds[] = $firstNarrator;
                $hadithToCompanionId[$chain->HadithMainID] = $firstNarrator;
            }
        }

        $companions = [];
        if (!empty($companionIds)) {
            $companions = DB::table('nouns')
                ->whereIn('ID', array_unique($companionIds))
                ->pluck('Name', 'ID');
        }

        $results = [];
        foreach ($hadiths as $h) {
            $companionName = null;
            if (isset($hadithToCompanionId[$h->MainID])) {
                $compId = $hadithToCompanionId[$h->MainID];
                $companionName = $companions[$compId] ?? null;
            }

            $results[] = [
                'book_id' => $h->BookID,
                'book_name' => $h->BookName,
                'companion_name' => $companionName,
                'part' => $h->PartNum,
                'page' => $h->PageNum,
                'tarqeem' => $h->TarqeemMatboa1
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $results
        ]);
    }
}
