<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $ID
 * @property string|null $Name
 * @property int $ParentID
 * @property int $IsLeaf
 * @property int|null $LeftValue
 * @property int|null $RightValue
 * @property int|null $RawyID
 * @property int|null $isMarfoa
 * @property int|null $isMawkof
 * @property int|null $isMaktoa
 * @property int|null $isMarfoaHokm
 */
class AsanedTree extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'asanedtree';

    /**
     * Primary key for the table.
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
     * The attributes that are guarded.
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
        'LeftValue' => 'integer',
        'RightValue' => 'integer',
        'RawyID' => 'integer',
        'isMarfoa' => 'integer',
        'isMawkof' => 'integer',
        'isMaktoa' => 'integer',
        'isMarfoaHokm' => 'integer',
    ];

    /**
     * Parent node in the tree.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Children nodes in the tree.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID');
    }
}
