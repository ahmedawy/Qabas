<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndexCategory extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'index';

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
    ];

    /**
     * Get the parent index category.
     *
     * @return BelongsTo<IndexCategory, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Get the child index categories.
     *
     * @return HasMany<IndexCategory, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID')->orderBy('ID');
    }

    /**
     * Get the index items in this category.
     *
     * @return HasMany<IndexItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(IndexItem::class, 'IndexID', 'ID');
    }
}
