<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BookTocHadith;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property BookTocHadith $resource
 */
class AtrafExtraResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'MainID' => (int) $this->resource->getAttribute('MainID'),
            'Title' => (string) $this->resource->getAttribute('Title'),
            'SrcCleanContent' => (string) $this->resource->getAttribute('SrcCleanContent'),
            'SrcAnnotations' => $this->resource->getAttribute('SrcAnnotations'),
            'TgtCleanContent' => (string) $this->resource->getAttribute('TgtCleanContent'),
            'TgtAnnotations' => $this->resource->getAttribute('TgtAnnotations'),
        ];
    }
}
