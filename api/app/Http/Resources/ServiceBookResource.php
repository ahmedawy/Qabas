<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ServiceBook;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property ServiceBook $resource
 */
class ServiceBookResource extends JsonResource
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
            'category' => $this->getCategory(),
        ];
    }

    /**
     * Dynamic categorization based on Book ID range.
     */
    private function getCategory(): string
    {
        $id = $this->resource->ID;
        if ($id <= 46) {
            return 'شروح الأحاديث النبوية (Commentaries)';
        }

        return 'كتب التراجم والرجال والتواريخ (Reference & Biographies)';
    }
}
