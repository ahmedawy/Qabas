<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NarratorRelation extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsrelations';

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
        'FirstRawyID' => 'integer',
        'SecondRawyID' => 'integer',
        'SayID' => 'integer',
        'RelationType' => 'integer',
        'IsShiekh' => 'boolean',
    ];

    /**
     * Get the first narrator in this relation.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function firstNarrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'FirstRawyID', 'ID');
    }

    /**
     * Get the second narrator in this relation.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function secondNarrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'SecondRawyID', 'ID');
    }

    /**
     * Get the relation type.
     *
     * @return BelongsTo<NarratorRelationType, $this>
     */
    public function relationType(): BelongsTo
    {
        return $this->belongsTo(NarratorRelationType::class, 'RelationType', 'ID');
    }

    /**
     * Get the scholarly opinion associated with this relation.
     *
     * @return BelongsTo<NarratorScientistSay, $this>
     */
    public function opinion(): BelongsTo
    {
        return $this->belongsTo(NarratorScientistSay::class, 'SayID', 'ID');
    }
}
