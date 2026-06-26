<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\BookTocHadith;
use App\Models\BookTocService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property BookTocHadith|BookTocService $resource
 */
class TocNodeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'MainID' => $this->MainID,
            'ParentID' => $this->ParentID,
            'IsLeaf' => (int) $this->IsLeaf,
            'Title' => $this->Tarf,
            'LeftValue' => $this->LeftValue ?? 0,
            'RightValue' => $this->RightValue ?? 0,
        ];
    }
}
