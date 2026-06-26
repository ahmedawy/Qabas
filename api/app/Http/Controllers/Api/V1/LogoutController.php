<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class LogoutController extends Controller
{
    /**
     * Handle user logout.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user) {
            /** @var PersonalAccessToken|null $token */
            $token = $user->currentAccessToken();
            if ($token) {
                $token->delete();
            }
        }

        return $this->jsonResponse([
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
