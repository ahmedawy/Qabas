<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QuranSurah;
use App\Models\QuranVerse;
use App\Models\QuranVerseDescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetIndexVersesController extends Controller
{
    private QuranSurah $surahModel;

    private QuranVerse $verseModel;

    private QuranVerseDescription $descModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(QuranSurah $surahModel, QuranVerse $verseModel, QuranVerseDescription $descModel)
    {
        $this->surahModel = $surahModel;
        $this->verseModel = $verseModel;
        $this->descModel = $descModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $surahId = $request->input('surah_id');
        $verseNum = $request->input('verse_num');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return explanation/hadiths for a specific verse
        if ($surahId !== null && $verseNum !== null) {
            $sId = (int) $surahId;
            $vNum = (int) $verseNum;

            $results = $this->descModel->newQuery()
                ->join('booktoc_services as s', 'quranayatdescrp.ServiceMainID', '=', 's.MainID')
                ->where('quranayatdescrp.Sura', $sId)
                ->where('quranayatdescrp.Aya', $vNum)
                ->select([
                    's.MainID as MainID',
                    's.BookName as BookName',
                    's.ID as HadithNum',
                    's.PartNum as PartNum',
                    's.PageNum as PageNum',
                    's.Tarf as Title',
                    's.CleanContent as CleanContent',
                    's.Annotations as Annotations',
                ])
                ->orderBy('s.MainID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'results' => $results->items(),
                'next_cursor' => $results->nextCursor() ? $results->nextCursor()->encode() : null,
            ]);
        }

        // Case 2: Load all verses for a Surah
        if ($surahId !== null) {
            $sId = (int) $surahId;
            $verses = $this->verseModel->newQuery()
                ->where('SoraID', $sId)
                ->orderBy('AyaNum')
                ->cursorPaginate(100);

            return $this->jsonResponse([
                'verses' => $verses->items(),
                'next_cursor' => $verses->nextCursor() ? $verses->nextCursor()->encode() : null,
            ]);
        }

        // Case 3: Search verses by query
        if ($query !== '') {
            $normalizedQuery = \Illuminate\Support\Facades\DB::selectOne("SELECT normalize_arabic(?) as q", [$query])->q;
            $words = array_filter(explode(' ', $normalizedQuery));
            $matchQuery = implode('* ', $words) . '*';

            $verses = $this->verseModel->newQuery()
                ->join('quransoar as s', 'quranayat.SoraID', '=', 's.ID')
                ->whereRaw('MATCH(quranayat.Text_Normalized) AGAINST(? IN BOOLEAN MODE)', [$matchQuery])
                ->select([
                    'quranayat.ID as ID',
                    'quranayat.SoraID as SoraID',
                    'quranayat.AyaNum as AyaNum',
                    'quranayat.Text as Text',
                    's.Name as SurahName',
                ])
                ->orderBy('quranayat.ID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'results' => $verses->items(),
                'next_cursor' => $verses->nextCursor() ? $verses->nextCursor()->encode() : null,
            ]);
        }

        // Case 4: Default list of Surahs
        $surahs = $this->surahModel->newQuery()
            ->orderBy('ID')
            ->get();

        return $this->jsonResponse([
            'surahs' => $surahs->toArray(),
        ]);
    }
}
