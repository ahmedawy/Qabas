<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\NarratorScientistSay;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property NarratorScientistSay $resource
 */
class ScholarOpinionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'RawyID' => $this->resource->RawyID,
            'RawyName' => $this->resource->narrator?->Name,
            'Say' => $this->resource->Say,
            'SaySort' => $this->resource->SaySort,
        ];
    }
}
