<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\HadithJudgmentHit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property HadithJudgmentHit $resource
 */
class HadithJudgmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'Say' => $this->resource->say?->Say,
            'ScientistName' => $this->resource->say?->scholar?->Name,
        ];
    }
}
