<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetUserController extends Controller
{
    /**
     * Get authenticated user.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return $this->errorResponse('غير مصرح', 401);
        }

        return $this->jsonResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
