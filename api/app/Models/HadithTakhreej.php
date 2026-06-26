<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HadithTakhreej extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'htakhreeg';

    /**
     * The primary key associated with the table.
     * Since the table does not have a single PK, we set it to null.
     *
     * @var null
     */
    protected $primaryKey = null;

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
        'GroupID' => 'integer',
        'CompoundMatnID' => 'integer',
        'PivotID' => 'integer',
        'MatnLength' => 'integer',
        'IsStory' => 'integer',
        'BookID' => 'integer',
    ];

    /**
     * Get the Hadith paragraph of this takhreej entry.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'HadithMainID', 'MainID');
    }
}
