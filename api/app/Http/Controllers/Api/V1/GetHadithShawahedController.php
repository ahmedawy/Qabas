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

                // 1. Get master companion ID (first narrator in SandRwah)
        $masterCompanionId = null;
        $masterSanad = DB::table('asanedhadiths as ah')
            ->join('asaned as a', 'ah.SanadID', '=', 'a.ID')
            ->where('ah.HadithMainID', $hadithId)
            ->first();
        if ($masterSanad) {
            $narrators = explode(' ', trim($masterSanad->SandRwah));
            foreach ($narrators as $n) {
                if (!empty($n)) {
                    $masterCompanionId = (int)$n;
                    break;
                }
            }
        }

        // 2. Get combined matn GroupID
        $combinedGroup = DB::table('hgamhalmatn')
            ->where('HadithMainID', $hadithId)
            ->value('GroupID');

        if (!$combinedGroup) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // 3. Get all members in the combined group
        $memberIds = DB::table('hgamhalmatn')
            ->where('GroupID', $combinedGroup)
            ->where('HadithMainID', '!=', $hadithId)
            ->pluck('HadithMainID')
            ->toArray();

        if (empty($memberIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // 4. Fetch companions mapping for members
        $asanedData = DB::table('asanedhadiths as ah')
            ->join('asaned as a', 'ah.SanadID', '=', 'a.ID')
            ->whereIn('ah.HadithMainID', $memberIds)
            ->select('ah.HadithMainID', 'a.SandRwah')
            ->get();

        $hadithToCompanionId = [];
        foreach ($asanedData as $chain) {
            $narrators = explode(' ', trim($chain->SandRwah));
            $firstNarrator = null;
            foreach ($narrators as $n) {
                if (!empty($n)) {
                    $firstNarrator = (int)$n;
                    break;
                }
            }
            if ($firstNarrator) {
                $hadithToCompanionId[$chain->HadithMainID] = $firstNarrator;
            }
        }

        $shawahedIds = [];
        foreach ($memberIds as $mid) {
            $compId = $hadithToCompanionId[$mid] ?? null;
            if ($compId !== null && $compId !== $masterCompanionId) {
                $shawahedIds[] = $mid;
            }
        }

        if (empty($shawahedIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // Bulk fetch hadiths metadata
        $hadiths = DB::table('booktoc_hadith')
            ->join('hadith_books', 'booktoc_hadith.BookID', '=', 'hadith_books.ID')
            ->whereIn('booktoc_hadith.MainID', $shawahedIds)
            ->select(
                'booktoc_hadith.MainID', 
                'booktoc_hadith.BookID', 
                'booktoc_hadith.BookName', 
                'booktoc_hadith.PartNum', 
                'booktoc_hadith.PageNum', 
                'booktoc_hadith.TarqeemMatboa1',
                'hadith_books.TakhreejAuthor',
                'hadith_books.TakhreejBook'
            )
            ->get();

        $companionIds = array_filter(array_unique(array_values($hadithToCompanionId)));
        $companions = [];
        if (!empty($companionIds)) {
            $companions = DB::table('nouns')
                ->whereIn('ID', $companionIds)
                ->pluck(DB::raw('COALESCE(NULLIF(AbbName, ""), Name)'), 'ID');
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
                'takhreej_author' => $h->TakhreejAuthor,
                'takhreej_book' => $h->TakhreejBook,
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
