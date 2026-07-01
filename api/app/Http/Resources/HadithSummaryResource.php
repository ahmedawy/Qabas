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
class HadithSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $flags = (int) ($this->resource->ServiceFlags ?? 0);

        $hasCompound = \Illuminate\Support\Facades\Cache::remember("hadith_has_compound_{$this->resource->MainID}", 3600, function() {
            return \Illuminate\Support\Facades\DB::table('htakhreeg')
                ->where('HadithMainID', $this->resource->MainID)
                ->where('CompoundMatnID', '>', 0)
                ->exists() || \Illuminate\Support\Facades\DB::table('hcompoundmatn')
                ->where('HadithMainID', $this->resource->MainID)
                ->exists();
        });

        if ($hasCompound) {
            $flags |= 512;
        }

        return [
            'MainID' => $this->resource->MainID,
            'BookID' => $this->resource->BookID,
            'BookName' => $this->resource->BookName,
            'HadithNum' => $this->resource->ID,
            'CleanContent' => $this->resource->CleanContent,
            'Annotations' => $this->resource->Annotations,
            'PartNum' => $this->resource->PartNum,
            'PageNum' => $this->resource->PageNum,
            'ParentID' => $this->resource->ParentID,
            'ServiceFlags' => $flags,
        ];
    }
}
