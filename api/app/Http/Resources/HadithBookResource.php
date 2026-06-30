<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\HadithBook;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property HadithBook $resource
 */
class HadithBookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'ID' => $this->resource->ID,
            'Title' => $this->resource->Title,
            'Summary' => $this->resource->Summary,
            'AuthorID' => $this->resource->AuthorID,
            'AuthorName' => $this->resource->author?->ShortName,
            'AuthorDeath' => $this->resource->author?->DeathDate,
            'category' => 'متون الحديث المسندة (Hadith Texts)',
        ];
    }
}
