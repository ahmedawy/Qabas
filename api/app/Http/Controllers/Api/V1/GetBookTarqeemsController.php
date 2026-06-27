<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;

class GetBookTarqeemsController extends Controller
{
    private BookTocHadith $bookTocHadithModel;

    public function __construct(BookTocHadith $bookTocHadithModel)
    {
        $this->bookTocHadithModel = $bookTocHadithModel;
    }

    public function __invoke(int $id): JsonResponse
    {
        $tarqeems = ['ID', 'TarqeemHarf', 'TarqeemMatboa1', 'TarqeemMatboa2'];
        $response = [];
        $part = request()->query('part');

        foreach ($tarqeems as $t) {
            if ($t === 'ID') {
                // Book-wide stats
                $statsBook = $this->bookTocHadithModel->newQuery()
                    ->where('BookID', $id)
                    ->selectRaw('MIN(ID) as min_h, MAX(ID) as max_h, MIN(PartNum) as min_part, MAX(PartNum) as max_part, MIN(PageNum) as min_page, MAX(PageNum) as max_page')
                    ->first();
                
                $minPage = $statsBook->min_page !== null ? (int) $statsBook->min_page : null;
                $maxPage = $statsBook->max_page !== null ? (int) $statsBook->max_page : null;
                
                if ($part !== null && $part !== '') {
                    $statsPart = $this->bookTocHadithModel->newQuery()
                        ->where('BookID', $id)
                        ->where('PartNum', $part)
                        ->selectRaw('MIN(PageNum) as min_page, MAX(PageNum) as max_page')
                        ->first();
                    if ($statsPart && $statsPart->min_page !== null) {
                        $minPage = (int) $statsPart->min_page;
                        $maxPage = (int) $statsPart->max_page;
                    }
                }

                $response[$t] = [
                    'available' => true,
                    'min_hadith' => $statsBook->min_h !== null ? (int) $statsBook->min_h : null,
                    'max_hadith' => $statsBook->max_h !== null ? (int) $statsBook->max_h : null,
                    'min_part' => $statsBook->min_part !== null ? (int) $statsBook->min_part : null,
                    'max_part' => $statsBook->max_part !== null ? (int) $statsBook->max_part : null,
                    'min_page' => $minPage,
                    'max_page' => $maxPage,
                ];
            } else {
                // Book-wide stats
                $statsBook = $this->bookTocHadithModel->newQuery()
                    ->where('BookID', $id)
                    ->whereNotNull($t)
                    ->where($t, '!=', '')
                    ->selectRaw("MIN(CAST($t AS UNSIGNED)) as min_h, MAX(CAST($t AS UNSIGNED)) as max_h, MIN(PartNum) as min_part, MAX(PartNum) as max_part, MIN(PageNum) as min_page, MAX(PageNum) as max_page")
                    ->first();
                    
                if ($statsBook && $statsBook->min_h !== null) {
                    $minPage = $statsBook->min_page !== null ? (int) $statsBook->min_page : null;
                    $maxPage = $statsBook->max_page !== null ? (int) $statsBook->max_page : null;
                    
                    if ($part !== null && $part !== '') {
                        $statsPart = $this->bookTocHadithModel->newQuery()
                            ->where('BookID', $id)
                            ->whereNotNull($t)
                            ->where($t, '!=', '')
                            ->where('PartNum', $part)
                            ->selectRaw('MIN(PageNum) as min_page, MAX(PageNum) as max_page')
                            ->first();
                        if ($statsPart && $statsPart->min_page !== null) {
                            $minPage = (int) $statsPart->min_page;
                            $maxPage = (int) $statsPart->max_page;
                        }
                    }

                    $response[$t] = [
                        'available' => true,
                        'min_hadith' => (int) $statsBook->min_h,
                        'max_hadith' => (int) $statsBook->max_h,
                        'min_part' => $statsBook->min_part !== null ? (int) $statsBook->min_part : null,
                        'max_part' => $statsBook->max_part !== null ? (int) $statsBook->max_part : null,
                        'min_page' => $minPage,
                        'max_page' => $maxPage,
                    ];
                } else {
                    $response[$t] = ['available' => false];
                }
            }
        }

        return $this->jsonResponse($response);
    }
}
