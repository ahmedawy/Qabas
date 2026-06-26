<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ControversialNode extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithcontroversialtree';

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
        'IsColored' => 'boolean',
    ];

    /**
     * Get the parent controversial node.
     *
     * @return BelongsTo<ControversialNode, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Get the child controversial nodes.
     *
     * @return HasMany<ControversialNode, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID')->orderBy('ID');
    }

    /**
     * Get the descriptions/explanations associated with this controversial topic.
     *
     * @return HasMany<ControversialDescription, $this>
     */
    public function descriptions(): HasMany
    {
        return $this->hasMany(ControversialDescription::class, 'NodeID', 'ID');
    }
}
