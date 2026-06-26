<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property string|null $Text
 * @property int|null $Sort
 * @property bool|null $IsTaqreeb
 * @property int|null $links_count
 */
class CritiqueTerm extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nounsgarh';

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
        'Sort' => 'integer',
        'IsTaqreeb' => 'boolean',
    ];

    /**
     * Get the links connecting this term to narrators.
     *
     * @return HasMany<CritiqueTermLink, $this>
     */
    public function links(): HasMany
    {
        return $this->hasMany(CritiqueTermLink::class, 'GarhID', 'ID');
    }
}
