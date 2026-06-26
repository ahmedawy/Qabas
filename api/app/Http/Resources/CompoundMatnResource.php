<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CompoundMatn;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property CompoundMatn $resource
 */
class CompoundMatnResource extends JsonResource
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
            'HadithMainID' => (int) $this->resource->getAttribute('HadithMainID'),
            'CleanMatn' => $this->resource->CleanMatn,
            'MatnAnnotations' => $this->resource->MatnAnnotations,
            'AsanedComp' => $this->resource->getAttribute('AsanedComp'),
            'BookName' => $this->resource->getAttribute('BookName'),
            'HadithNum' => $this->resource->getAttribute('HadithNum'),
        ];
    }
}
