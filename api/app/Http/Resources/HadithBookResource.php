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
     * Get legacy Hadith book category classification.
     */
    private function getBookCategory(int $id): string
    {
        return match ($id) {
            1, 2, 8, 17, 18, 19 => 'الصحاح',
            3, 4, 5, 6, 7, 12, 16, 20, 21, 22, 23, 30 => 'السنن',
            9, 11, 14, 15, 24, 25, 29, 31, 32 => 'المسانيد',
            10, 13 => 'المصنفات',
            26, 27, 28 => 'المعاجم',
            default => 'الأجزاء والسنن',
        };
    }

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
            'category' => $this->getBookCategory((int) $this->resource->ID),
        ];
    }
}
