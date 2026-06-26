<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatsAtrafResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $arr = (array) $this->resource;

        return [
            'BookName' => (string) ($arr['BookName'] ?? $arr['bookname'] ?? ''),
            'Count' => (int) ($arr['Count'] ?? $arr['count'] ?? 0),
        ];
    }
}
