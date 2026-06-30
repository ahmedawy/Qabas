<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceBookResource;
use App\Models\ServiceBook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetServiceBooksController extends Controller
{
    private ServiceBook $bookModel;

    /**
     * Inject model constructor dependency.
     */
    public function __construct(ServiceBook $bookModel)
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
            'books' => ServiceBookResource::collection($books),
        ]);
    }
}
