<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $SayID
 * @property int $HadithMainID
 * @property-read JudgmentSay|null $say
 */
class HadithJudgmentHit extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithjudgmenthits';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

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
        'SayID' => 'integer',
        'HadithMainID' => 'integer',
    ];

    /**
     * Get the scholarly judgment text of this link.
     *
     * @return BelongsTo<JudgmentSay, $this>
     */
    public function say(): BelongsTo
    {
        return $this->belongsTo(JudgmentSay::class, 'SayID', 'ID');
    }

    /**
     * Get the Hadith associated with this judgment link.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'HadithMainID', 'MainID');
    }
}
