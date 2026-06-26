<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    private User $userModel;

    /**
     * Inject constructor dependency.
     */
    public function __construct(User $userModel)
    {
        $this->userModel = $userModel;
    }

    /**
     * Handle user login.
     *
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = $this->userModel->newQuery()
            ->where('email', $request->input('email'))
            ->first();

        if (! $user || ! password_verify($request->input('password'), $user->password)) {
            return $this->errorResponse('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->jsonResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ]);
    }
}
