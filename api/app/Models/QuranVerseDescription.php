<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuranVerseDescription extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'quranayatdescrp';

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
        'ID' => 'integer',
        'ServiceMainID' => 'integer',
        'Sura' => 'integer',
        'Aya' => 'integer',
    ];

    /**
     * Get the Quran verse of this explanation.
     *
     * @return BelongsTo<QuranVerse, $this>
     */
    public function verse(): BelongsTo
    {
        return $this->belongsTo(QuranVerse::class, 'ID', 'ID');
    }

    /**
     * Get the service content detail paragraph.
     *
     * @return BelongsTo<BookTocService, $this>
     */
    public function serviceContent(): BelongsTo
    {
        return $this->belongsTo(BookTocService::class, 'ServiceMainID', 'MainID');
    }
}
