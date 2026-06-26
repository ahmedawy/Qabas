<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property string $SandRwah
 * @property string $SandTypes
 * @property int $HadithsCount
 */
class TransmissionChain extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'asaned';

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
        'HadithsCount' => 'integer',
    ];

    /**
     * Get the hadith associations for this chain.
     *
     * @return HasMany<AsanedHadith, $this>
     */
    public function hadithLinks(): HasMany
    {
        return $this->hasMany(AsanedHadith::class, 'SanadID', 'ID');
    }

    /**
     * Get the Hadith texts associated with this chain.
     *
     * @return BelongsToMany<BookTocHadith, $this>
     */
    public function hadiths(): BelongsToMany
    {
        return $this->belongsToMany(
            BookTocHadith::class,
            'asanedhadiths',
            'SanadID',       // FK on pivot table pointing to this chain
            'HadithMainID',  // FK on pivot table pointing to Hadith
            'ID',            // Local key on this chain
            'MainID'         // Local key on BookTocHadith
        );
    }

    /**
     * Parse and get the array of narrator IDs from the space-separated string.
     *
     * @return array<int, int>
     */
    public function getNarratorIds(): array
    {
        $raw = $this->SandRwah ?? '';
        $trimmed = trim((string) $raw);
        if ($trimmed === '') {
            return [];
        }

        return array_map('intval', explode(' ', $trimmed));
    }
}
