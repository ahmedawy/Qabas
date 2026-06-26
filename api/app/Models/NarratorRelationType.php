<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NarratorRelationType extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsrelationstypes';

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
        'ParentID' => 'integer',
        'IsLeaf' => 'boolean',
        'NodeID' => 'integer',
    ];

    /**
     * Get the relations of this type.
     *
     * @return HasMany<NarratorRelation, $this>
     */
    public function relations(): HasMany
    {
        return $this->hasMany(NarratorRelation::class, 'RelationType', 'ID');
    }
}
