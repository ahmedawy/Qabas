<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Return a standardized successful JSON response.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, string>  $headers
     */
    protected function jsonResponse(array $data, int $status = 200, array $headers = []): JsonResponse
    {
        return response()->json(array_merge([
            'success' => true,
        ], $data), $status, $headers);
    }

    /**
     * Return a standardized error JSON response.
     *
     * @param  array<string, mixed>  $errors
     */
    protected function errorResponse(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'error' => $message,
        ];

        if ($errors !== []) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}
