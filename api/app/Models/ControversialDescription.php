<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ControversialDescription extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithcontroverialdescrp';

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
        'ServiceMainID' => 'integer',
    ];

    /**
     * Get the controversial topic node this links to.
     *
     * @return BelongsTo<ControversialNode, $this>
     */
    public function controversialNode(): BelongsTo
    {
        return $this->belongsTo(ControversialNode::class, 'NodeID', 'ID');
    }

    /**
     * Get the service content detail of this reconciliation/discussion text.
     *
     * @return BelongsTo<BookTocService, $this>
     */
    public function serviceContent(): BelongsTo
    {
        return $this->belongsTo(BookTocService::class, 'ServiceMainID', 'MainID');
    }
}
