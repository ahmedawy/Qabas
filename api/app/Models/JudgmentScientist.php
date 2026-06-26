<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property string $Name
 */
class JudgmentScientist extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hadithjudgmentscientists';

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
    ];

    /**
     * Get the judgments issued by this scholar.
     *
     * @return HasMany<JudgmentSay, $this>
     */
    public function judgments(): HasMany
    {
        return $this->hasMany(JudgmentSay::class, 'ScientistID', 'ID');
    }
}
