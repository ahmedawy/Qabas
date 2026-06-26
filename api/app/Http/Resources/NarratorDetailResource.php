<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Narrator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Narrator $resource
 */
class NarratorDetailResource extends JsonResource
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
            'Nasab' => $this->resource->Nasab,
            'Tabaqa' => $this->resource->Tabaqa,
            'TabaqaNum' => $this->resource->TabaqaNum,
            'BirthYear' => $this->resource->BirthYear,
            'DeathYear' => $this->resource->DeathYear,
            'DeathYearNum' => $this->resource->DeathYearNum,
            'MartabaIbnHajar' => $this->resource->MartabaIbnHajar,
            'MartabaZahabi' => $this->resource->MartabaZahabi,
            'LivingCity' => $this->resource->LivingCity,
            'DeathCity' => $this->resource->DeathCity,
            'EsmShuhra' => $this->resource->EsmShuhra,
            'HadithsCount' => $this->resource->HadithsCount,
        ];
    }
}
