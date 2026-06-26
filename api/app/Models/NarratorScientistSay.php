<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $ID
 * @property int $RawyID
 * @property int $NScientistID
 * @property string $Say
 * @property int $SaySort
 * @property Narrator|null $narrator
 * @property BiographyScientist|null $scholar
 */
class NarratorScientistSay extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsscientistssays';

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
        'RawyID' => 'integer',
        'NScientistID' => 'integer',
        'SaySort' => 'integer',
    ];

    /**
     * Get the narrator this opinion is about.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function narrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'RawyID', 'ID');
    }

    /**
     * Get the scholar who wrote this opinion.
     *
     * @return BelongsTo<BiographyScientist, $this>
     */
    public function scholar(): BelongsTo
    {
        return $this->belongsTo(BiographyScientist::class, 'NScientistID', 'ID');
    }
}
