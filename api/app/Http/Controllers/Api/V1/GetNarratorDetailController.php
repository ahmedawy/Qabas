<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\NarratorDetailResource;
use App\Models\Narrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetNarratorDetailController extends Controller
{
    private Narrator $narratorModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(Narrator $narratorModel)
    {
        $this->narratorModel = $narratorModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Narrator ID', 400);
        }

        /** @var Narrator|null $narrator */
        $narrator = $this->narratorModel->newQuery()
            ->where('ID', $id)
            ->first();

        if (! $narrator) {
            return $this->errorResponse('Narrator not found', 404);
        }

        $tab = $request->input('tab');

        if ($tab === 'opinions') {
            // 4. Jarh wa Ta'dil
            $opinions = \DB::table('nounsscientistssays')
                ->where('RawyID', $id)
                ->join('nounsscientists', 'nounsscientistssays.NScientistID', '=', 'nounsscientists.ID')
                ->select(
                    'nounsscientistssays.ID',
                    'nounsscientists.ScientistName',
                    'nounsscientistssays.Say',
                    'nounsscientistssays.SaySort'
                )
                ->orderBy('nounsscientistssays.SaySort')
                ->get();
            return $this->jsonResponse(['opinions' => $opinions]);
        }

        if ($tab === 'classifications') {
            // 5. Special classifications and benefits
            $classifications = \DB::table('nounsrelations')
                ->where('FirstRawyID', $id)
                ->join('nounsrelationstypes', 'nounsrelations.RelationType', '=', 'nounsrelationstypes.ID')
                ->leftJoin('nounsscientistssays', 'nounsrelations.SayID', '=', 'nounsscientistssays.ID')
                ->leftJoin('nounsscientists', 'nounsscientistssays.NScientistID', '=', 'nounsscientists.ID')
                ->select(
                    'nounsrelations.RelationType',
                    'nounsrelationstypes.Text as RelationTypeName',
                    'nounsscientists.ScientistName',
                    'nounsscientistssays.Say'
                )
                ->get();
            return $this->jsonResponse(['classifications' => $classifications]);
        }

        if ($tab === 'forms') {
            // 6. Name Forms
            $forms = \DB::table('nounsforms')
                ->where('RawyID', $id)
                ->select('ID', 'RawyText', 'Frequency')
                ->orderBy('Frequency', 'desc')
                ->get();
            return $this->jsonResponse(['forms' => $forms]);
        }

        if ($tab === 'sources') {
            // 8. Translation / Biography Sources
            $sources = \DB::table('nounstranslation')
                ->where('NounID', $id)
                ->join('booktoc_services', 'nounstranslation.ServiceMainID', '=', 'booktoc_services.MainID')
                ->select('nounstranslation.ServiceMainID', 'booktoc_services.BookName', 'booktoc_services.CleanContent as CleanContent', 'booktoc_services.Annotations as Annotations')
                ->get();
            return $this->jsonResponse(['sources' => $sources]);
        }

        if ($tab === 'hadiths') {
            // 7. Narrated Hadiths
            $matchingSanads = \DB::table('asaned')
                ->whereRaw('MATCH(SandRwah_Normalized) AGAINST(? IN BOOLEAN MODE)', ["+narrator_{$id}"])
                ->pluck('ID');

            $hadiths = \DB::table('asanedhadiths')
                ->whereIn('SanadID', $matchingSanads)
                ->join('booktoc_hadith', 'asanedhadiths.HadithMainID', '=', 'booktoc_hadith.MainID')
                ->select(
                    'booktoc_hadith.MainID',
                    'booktoc_hadith.BookID',
                    'booktoc_hadith.BookName',
                    'booktoc_hadith.ID as HadithNum',
                    'booktoc_hadith.Tarf',
                    'booktoc_hadith.PartNum',
                    'booktoc_hadith.PageNum',
                    'booktoc_hadith.ServiceFlags'
                )
                ->distinct()
                ->paginate(15);

            return $this->jsonResponse([
                'hadiths' => $hadiths->items(),
                'pagination' => [
                    'total' => $hadiths->total(),
                    'per_page' => $hadiths->perPage(),
                    'current_page' => $hadiths->currentPage(),
                    'last_page' => $hadiths->lastPage(),
                ]
            ]);
        }

        // Default response: Card parameters (Tab 1), Sheikhs (Tab 2), Talamidh (Tab 3)
        $sheikhs = \DB::table('nounsshyoukhtalamize')
            ->where('RawyID', $id)
            ->join('nouns', 'nounsshyoukhtalamize.ShyoukhID', '=', 'nouns.ID')
            ->select('nouns.ID', 'nouns.Name', 'nounsshyoukhtalamize.HadithsCount')
            ->orderBy('nounsshyoukhtalamize.HadithsCount', 'desc')
            ->get();

        $talamidh = \DB::table('nounsshyoukhtalamize')
            ->where('ShyoukhID', $id)
            ->join('nouns', 'nounsshyoukhtalamize.RawyID', '=', 'nouns.ID')
            ->select('nouns.ID', 'nouns.Name', 'nounsshyoukhtalamize.HadithsCount')
            ->orderBy('nounsshyoukhtalamize.HadithsCount', 'desc')
            ->get();

        return $this->jsonResponse([
            'narrator' => new NarratorDetailResource($narrator),
            'sheikhs' => $sheikhs,
            'talamidh' => $talamidh,
        ]);
    }
}
