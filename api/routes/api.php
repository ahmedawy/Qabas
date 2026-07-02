<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\GetAmthalController;
use App\Http\Controllers\Api\V1\GetAtrafAsanedController;
use App\Http\Controllers\Api\V1\GetAtrafExtraController;
use App\Http\Controllers\Api\V1\GetAtrafListController;
use App\Http\Controllers\Api\V1\GetBookmarksController;
use App\Http\Controllers\Api\V1\GetHadithBooksController;
use App\Http\Controllers\Api\V1\GetServiceBooksController;
use App\Http\Controllers\Api\V1\GetBookTarqeemsController;
use App\Http\Controllers\Api\V1\GetBookTocController;
use App\Http\Controllers\Api\V1\GetChapterHadithsController;
use App\Http\Controllers\Api\V1\GetControversialController;
use App\Http\Controllers\Api\V1\GetCritiqueTermsController;
use App\Http\Controllers\Api\V1\GetDatesController;
use App\Http\Controllers\Api\V1\GetDefinitionsController;
use App\Http\Controllers\Api\V1\GetExpressionTreeController;
use App\Http\Controllers\Api\V1\GetGroupedMtnController;
use App\Http\Controllers\Api\V1\GetHadithByNumberController;
use App\Http\Controllers\Api\V1\GetHadithByPageController;
use App\Http\Controllers\Api\V1\GetHadithJudgmentsController;
use App\Http\Controllers\Api\V1\GetHadithChainsController;
use App\Http\Controllers\Api\V1\GetHadithTakhreejController;
use App\Http\Controllers\Api\V1\GetHadithShawahedController;
use App\Http\Controllers\Api\V1\GetMatnComparisonController;
use App\Http\Controllers\Api\V1\GetHadithServiceBooksController;
use App\Http\Controllers\Api\V1\GetHadithCommentaryController;
use App\Http\Controllers\Api\V1\GetHadithThematicController;
use App\Http\Controllers\Api\V1\GetHadithAnalysisController;
use App\Http\Controllers\Api\V1\GetHadithAnalysisTreeController;
use App\Http\Controllers\Api\V1\GetHadithOccasionsController;
use App\Http\Controllers\Api\V1\GetIndexNamesController;
use App\Http\Controllers\Api\V1\GetIndexPoetryController;
use App\Http\Controllers\Api\V1\GetIndexVersesController;
use App\Http\Controllers\Api\V1\GetLexiconGhareebController;
use App\Http\Controllers\Api\V1\GetLexiconPlacesController;
use App\Http\Controllers\Api\V1\GetLexiconWordController;
use App\Http\Controllers\Api\V1\GetMosannafatStatsController;
use App\Http\Controllers\Api\V1\GetNarratorClassificationsController;
use App\Http\Controllers\Api\V1\GetNarratorDetailController;
use App\Http\Controllers\Api\V1\GetNarratorsByBookController;
use App\Http\Controllers\Api\V1\GetRwahExtraController;
use App\Http\Controllers\Api\V1\GetScholarOpinionsController;
use App\Http\Controllers\Api\V1\GetScSayHadithController;
use App\Http\Controllers\Api\V1\GetScSayScienceController;
use App\Http\Controllers\Api\V1\GetStatsAtrafController;
use App\Http\Controllers\Api\V1\GetStatsRwahBooksController;
use App\Http\Controllers\Api\V1\GetStatsRwahController;
use App\Http\Controllers\Api\V1\GetSubjectTreeController;
use App\Http\Controllers\Api\V1\GetTransmissionChainController;
use App\Http\Controllers\Api\V1\GetCombinedTransmissionChainController;
use App\Http\Controllers\Api\V1\GetCombinedTakhreejChainController;
use App\Http\Controllers\Api\V1\GetUserController;
use App\Http\Controllers\Api\V1\ListNarratorsController;
use App\Http\Controllers\Api\V1\LoginController;
use App\Http\Controllers\Api\V1\LogoutController;
use App\Http\Controllers\Api\V1\RegisterController;
use App\Http\Controllers\Api\V1\GetTagTypesController;
use App\Http\Controllers\Api\V1\SearchHadithsController;
use App\Http\Controllers\Api\V1\ToggleBookmarkController;
use Illuminate\Routing\Router;

/** @var Router $router */
$router = app('router');

$router->prefix('v1')->group(function (Router $router) {
    $router->get('/status', function () {
        return response()->json([
            'success' => true,
            'status' => 'online',
            'version' => '1.0.0',
        ]);
    });

    $router->get('/tag_types', GetTagTypesController::class);

    // Module 4: Books & Reading Viewer
    $router->get('/hadith-books', GetHadithBooksController::class);
    $router->get('/hadith-books/{id}/tarqeems', GetBookTarqeemsController::class);
    $router->get('/service-books', GetServiceBooksController::class);
    $router->get('/toc', GetBookTocController::class);
    $router->get('/hadith/judgments', GetHadithJudgmentsController::class);
    $router->get('/hadith/chains', GetHadithChainsController::class);
    $router->get('/hadith/takhreej', GetHadithTakhreejController::class);
    $router->get('/hadith/matn-comparison', GetMatnComparisonController::class);
    $router->get('/hadith/{id}/shawahed', GetHadithShawahedController::class);
    $router->get('/hadith/{id}/service-books', GetHadithServiceBooksController::class);
    $router->get('/hadith/commentary', GetHadithCommentaryController::class);
    $router->get('/hadith/thematic', GetHadithThematicController::class);
    $router->get('/hadith/analysis', GetHadithAnalysisController::class);
    $router->get('/hadith/{id}/analysis-tree', GetHadithAnalysisTreeController::class);
    $router->get('/hadith/occasions', GetHadithOccasionsController::class);
    $router->get('/hadith_by_num', GetHadithByNumberController::class);
    $router->get('/hadith_by_page', GetHadithByPageController::class);
    $router->get('/chapter', GetChapterHadithsController::class);

    // Module 5: Search Engine
    $router->get('/search', SearchHadithsController::class);

    // Module 6 & 7: Narrators & Transmission Chains
    $router->get('/rwah_list', ListNarratorsController::class);
    $router->get('/narrator', GetNarratorDetailController::class);
    $router->get('/rwah_books', GetNarratorsByBookController::class);
    $router->get('/rwah_classification', GetNarratorClassificationsController::class);
    $router->get('/rwah_garh', GetCritiqueTermsController::class);
    $router->get('/rwah_opinions', GetScholarOpinionsController::class);
    $router->get('/sanad', GetTransmissionChainController::class);
    $router->post('/combined_sanad', GetCombinedTransmissionChainController::class);
    $router->post('/combined_sanad_takhreej', GetCombinedTakhreejChainController::class);
    $router->get('/lexicon', GetLexiconWordController::class);

    // Module 8: Atraf & Comparisons
    $router->get('/atraf_list', GetAtrafListController::class);
    $router->get('/atraf_asaned', GetAtrafAsanedController::class);
    $router->get('/atraf_extra', GetAtrafExtraController::class);
    $router->get('/rwah_extra', GetRwahExtraController::class);
    $router->get('/grouped_mtn', GetGroupedMtnController::class);

    // Module 9: Thematic Trees & Lexicons
    $router->get('/subject_tree', GetSubjectTreeController::class);
    $router->get('/controversial', GetControversialController::class);
    $router->get('/lexicon_ghareeb', GetLexiconGhareebController::class);
    $router->get('/lexicon_places', GetLexiconPlacesController::class);
    $router->get('/amthal', GetAmthalController::class);
    $router->get('/dates', GetDatesController::class);

    // Module 10: Scholarly Sciences
    $router->get('/definitions', GetDefinitionsController::class);
    $router->get('/expression_tree', GetExpressionTreeController::class);
    $router->get('/sc_say_hadith', GetScSayHadithController::class);
    $router->get('/sc_say_science', GetScSayScienceController::class);
    $router->get('/index_verses', GetIndexVersesController::class);
    $router->get('/index_names', GetIndexNamesController::class);
    $router->get('/index_poetry', GetIndexPoetryController::class);

    // Module 11: Indexes & Statistics
    $router->get('/stats_rwah', GetStatsRwahController::class);
    $router->get('/stats_rwah_books', GetStatsRwahBooksController::class);
    $router->get('/stats_atraf', GetStatsAtrafController::class);
    $router->get('/stats_mosannafat', GetMosannafatStatsController::class);

    // Module 12: Authentication & Bookmarks
    $router->post('/register', RegisterController::class);
    $router->post('/login', LoginController::class);

    $router->middleware('auth:sanctum')->group(function (Router $router) {
        $router->post('/logout', LogoutController::class);
        $router->get('/user', GetUserController::class);
        $router->get('/bookmarks', GetBookmarksController::class);
        $router->post('/bookmarks/toggle', ToggleBookmarkController::class);
    });
});
