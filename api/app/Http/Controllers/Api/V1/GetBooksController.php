<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetBooksController extends Controller
{
    private Book $bookModel;

    /**
     * Inject model constructor dependency (no static facades).
     */
    public function __construct(Book $bookModel)
    {
        $this->bookModel = $bookModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $books = $this->bookModel->newQuery()
            ->with('author')
            ->orderBy('ID')
            ->get();

        return $this->jsonResponse([
            'books' => BookResource::collection($books),
        ]);
    }
}
