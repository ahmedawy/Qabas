<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
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
     * Handle user registration.
     *
     * @throws ValidationException
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var User $user */
        $user = $this->userModel->newQuery()->create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => $request->input('password'), // Automatically hashed by Eloquent casts
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->jsonResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ], 201);
    }
}
