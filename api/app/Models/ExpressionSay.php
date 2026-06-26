<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpressionSay extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithexpressionssays';

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
        'NodeID' => 'integer',
        'ScientistID' => 'integer',
        'ServiceMainID' => 'integer',
        'LinkID' => 'integer',
    ];

    /**
     * Get the expression node this saying belongs to.
     *
     * @return BelongsTo<ExpressionNode, $this>
     */
    public function expressionNode(): BelongsTo
    {
        return $this->belongsTo(ExpressionNode::class, 'NodeID', 'ID');
    }

    /**
     * Get the service content text of this saying.
     *
     * @return BelongsTo<BookTocService, $this>
     */
    public function serviceContent(): BelongsTo
    {
        return $this->belongsTo(BookTocService::class, 'ServiceMainID', 'MainID');
    }
}
