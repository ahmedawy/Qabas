<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuranVerse extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'quranayat';

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
        'SoraID' => 'integer',
        'AyaNum' => 'integer',
        'HasTafsser' => 'boolean',
        'HasQera' => 'boolean',
    ];

    /**
     * Get the Surah this verse belongs to.
     *
     * @return BelongsTo<QuranSurah, $this>
     */
    public function surah(): BelongsTo
    {
        return $this->belongsTo(QuranSurah::class, 'SoraID', 'ID');
    }

    /**
     * Get the links linking this verse to hadiths.
     *
     * @return HasMany<QuranVerseDescription, $this>
     */
    public function descriptionLinks(): HasMany
    {
        return $this->hasMany(QuranVerseDescription::class, 'ID', 'ID');
    }
}
