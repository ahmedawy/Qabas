<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NarratorTranslation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounstranslation';

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
        'NounID' => 'integer',
        'ServiceMainID' => 'integer',
    ];

    /**
     * Get the narrator of this translation.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function narrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'NounID', 'ID');
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
