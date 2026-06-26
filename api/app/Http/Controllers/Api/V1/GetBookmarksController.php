<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\HadithSummaryResource;
use App\Models\Bookmark;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetBookmarksController extends Controller
{
    private Bookmark $bookmarkModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(Bookmark $bookmarkModel)
    {
        $this->bookmarkModel = $bookmarkModel;
    }

    /**
     * List user bookmarks.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        if (! $userId) {
            return $this->errorResponse('غير مصرح', 401);
        }

        $bookmarks = $this->bookmarkModel->newQuery()
            ->where('user_id', $userId)
            ->with(['hadith'])
            ->orderBy('created_at', 'desc')
            ->get();

        $hadiths = $bookmarks->map(fn (Bookmark $bookmark) => $bookmark->hadith)
            ->filter(); // Removes null values if any

        return $this->jsonResponse([
            'bookmarks' => HadithSummaryResource::collection($hadiths),
        ]);
    }
}
