<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class GetTagTypesController extends Controller
{
    /**
     * Get all tag types and their mappings.
     */
    public function __invoke(): JsonResponse
    {
        return $this->jsonResponse([
            'data' => config('tag-types'),
        ]);
    }
}
