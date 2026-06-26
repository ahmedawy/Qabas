<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $LexiconItemID
 * @property int $DescrpMainID
 * @property BookTocService|null $serviceContent
 */
class LexiconDescription extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lexicondescrp';

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
        'LexiconItemID' => 'integer',
        'DescrpMainID' => 'integer',
    ];

    /**
     * Get the lexicon item this description belongs to.
     *
     * @return BelongsTo<LexiconItem, $this>
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(LexiconItem::class, 'LexiconItemID', 'ID');
    }

    /**
     * Get the service detail paragraph representing this description's text.
     *
     * @return BelongsTo<BookTocService, $this>
     */
    public function serviceContent(): BelongsTo
    {
        return $this->belongsTo(BookTocService::class, 'DescrpMainID', 'MainID');
    }
}
