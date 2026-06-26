<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property int $ScientistID
 * @property string $Say
 * @property int $LinkID
 * @property-read JudgmentScientist|null $scholar
 */
class JudgmentSay extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithjudgmentsays';

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
        'LinkID' => 'integer',
    ];

    /**
     * Get the scholar who issued this judgment.
     *
     * @return BelongsTo<JudgmentScientist, $this>
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(JudgmentScientist::class, 'ScientistID', 'ID');
    }

    /**
     * Get the Hadith links associated with this judgment text.
     *
     * @return HasMany<HadithJudgmentHit, $this>
     */
    public function hits(): HasMany
    {
        return $this->hasMany(HadithJudgmentHit::class, 'SayID', 'ID');
    }
}
