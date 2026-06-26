<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CritiqueTerm;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property CritiqueTerm $resource
 */
class CritiqueTermResource extends JsonResource
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
            'Term' => $this->resource->Text,
            'RwahCount' => $this->resource->links_count ?? (int) $this->resource->getAttribute('RwahCount'),
        ];
    }
}
