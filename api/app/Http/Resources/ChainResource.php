<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AsanedHadith;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property AsanedHadith $resource
 */
class ChainResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'SanadID' => $this->resource->SanadID,
            'SanadType' => $this->resource->SanadType,
            'SanadTahdethID' => $this->resource->SanadTahdethID,
            'SandRwah' => $this->resource->chain?->SandRwah,
            'HadithsCount' => $this->resource->chain?->HadithsCount,
        ];
    }
}
