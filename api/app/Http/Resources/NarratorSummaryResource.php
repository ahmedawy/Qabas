<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Narrator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Narrator $resource
 */
class NarratorSummaryResource extends JsonResource
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
            'Name' => $this->resource->Name,
            'AbbName' => $this->resource->AbbName,
            'Kunia' => $this->resource->Kunia,
            'Laqab' => $this->resource->Laqab,
            'Tabaqa' => $this->resource->Tabaqa,
            'DeathYear' => $this->resource->DeathYear,
            'HadithsCount' => $this->resource->HadithsCount,
        ];
    }
}
