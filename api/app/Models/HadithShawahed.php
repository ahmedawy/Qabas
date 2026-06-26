<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HadithShawahed extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithshawahed';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'HadithMainID';

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
        'HadithMainID' => 'integer',
    ];

    /**
     * Get the Hadith paragraph.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'HadithMainID', 'MainID');
    }
}
