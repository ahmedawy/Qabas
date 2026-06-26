<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NarratorNameForm extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsforms';

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
        'Frequency' => 'integer',
        'RawyTextID' => 'integer',
    ];

    /**
     * Get the narrator of this name form.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function narrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'RawyID', 'ID');
    }
}
