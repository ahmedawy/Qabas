<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CritiqueTermLink extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsgarhlinks';

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
        'RawyID' => 'integer',
        'GarhID' => 'integer',
        'SayID' => 'integer',
    ];

    /**
     * Get the narrator linked to this critique term.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function narrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'RawyID', 'ID');
    }

    /**
     * Get the critique term linked.
     *
     * @return BelongsTo<CritiqueTerm, $this>
     */
    public function term(): BelongsTo
    {
        return $this->belongsTo(CritiqueTerm::class, 'GarhID', 'ID');
    }
}
