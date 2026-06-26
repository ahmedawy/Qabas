<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpressionNode extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithexpressionstree';

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
        'IsLeaf' => 'integer',
        'NodeID' => 'integer',
        'IsMatn' => 'integer',
        'IsSand' => 'integer',
        'IsRawy' => 'integer',
        'IsColored' => 'integer',
    ];

    /**
     * Get the parent expression node.
     *
     * @return BelongsTo<ExpressionNode, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Get the child expression nodes.
     *
     * @return HasMany<ExpressionNode, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID')->orderBy('ID');
    }

    /**
     * Get the scholar commentaries/sayings on this expression node.
     *
     * @return HasMany<ExpressionSay, $this>
     */
    public function says(): HasMany
    {
        return $this->hasMany(ExpressionSay::class, 'NodeID', 'ID');
    }
}
