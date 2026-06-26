<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndexItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'indexitem';

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
        'IndexID' => 'integer',
    ];

    /**
     * Get the category this index item belongs to.
     *
     * @return BelongsTo<IndexCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(IndexCategory::class, 'IndexID', 'ID');
    }
}
