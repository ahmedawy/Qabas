<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BiographyScientist extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsscientists';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'ID';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'ID' => 'integer',
        'ScientistID' => 'integer',
        'RelaterID' => 'integer',
    ];

    /**
     * Get the opinions written by this biography scholar.
     *
     * @return HasMany<NarratorScientistSay, $this>
     */
    public function opinions(): HasMany
    {
        return $this->hasMany(NarratorScientistSay::class, 'NScientistID', 'ID');
    }
}
