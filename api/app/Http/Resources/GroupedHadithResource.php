<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BookTocHadith;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property BookTocHadith $resource
 */
class GroupedHadithResource extends JsonResource
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
            'BookName' => (string) $this->resource->getAttribute('BookName'),
            'HadithNum' => $this->resource->getAttribute('HadithNum'),
            'PartNum' => (int) $this->resource->getAttribute('PartNum'),
            'PageNum' => (int) $this->resource->getAttribute('PageNum'),
            'Title' => (string) $this->resource->getAttribute('Title'),
            'CleanContent' => (string) $this->resource->getAttribute('CleanContent'),
            'Annotations' => $this->resource->getAttribute('Annotations'),
            'ServiceFlags' => (int) ($this->resource->getAttribute('ServiceFlags') ?? 0),
        ];
    }
}
