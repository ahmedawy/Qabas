<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Models\BookTocHadith;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToggleBookmarkController extends Controller
{
    private Bookmark $bookmarkModel;

    private BookTocHadith $hadithModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(Bookmark $bookmarkModel, BookTocHadith $hadithModel)
    {
        $this->bookmarkModel = $bookmarkModel;
        $this->hadithModel = $hadithModel;
    }

    /**
     * Toggle bookmark for a Hadith.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'hadith_main_id' => ['required', 'integer'],
        ]);

        $hadithMainId = (int) $request->input('hadith_main_id');

        // Check if Hadith exists
        $exists = $this->hadithModel->newQuery()
            ->where('MainID', $hadithMainId)
            ->exists();

        if (! $exists) {
            return $this->errorResponse('الحديث النبوي غير موجود', 404);
        }

        $userId = $request->user()?->id;
        if (! $userId) {
            return $this->errorResponse('غير مصرح', 401);
        }

        /** @var Bookmark|null $bookmark */
        $bookmark = $this->bookmarkModel->newQuery()
            ->where('user_id', $userId)
            ->where('hadith_main_id', $hadithMainId)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $bookmarked = false;
            $message = 'تمت إزالة الحديث من المفضلة';
        } else {
            $this->bookmarkModel->newQuery()->create([
                'user_id' => $userId,
                'hadith_main_id' => $hadithMainId,
            ]);
            $bookmarked = true;
            $message = 'تمت إضافة الحديث للمفضلة';
        }

        return $this->jsonResponse([
            'bookmarked' => $bookmarked,
            'message' => $message,
        ]);
    }
}
