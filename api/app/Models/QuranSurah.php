<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuranSurah extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'quransoar';

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
        'HasTafsser' => 'boolean',
        'HasQera' => 'boolean',
    ];

    /**
     * Get the verses in this Surah.
     *
     * @return HasMany<QuranVerse, $this>
     */
    public function verses(): HasMany
    {
        return $this->hasMany(QuranVerse::class, 'SoraID', 'ID');
    }
}
