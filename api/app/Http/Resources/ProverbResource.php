<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Proverb;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Proverb $resource
 */
class ProverbResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ID' => (int) $this->resource->getAttribute('ID'),
            'Text' => (string) $this->resource->getAttribute('Text'),
        ];
    }
}
