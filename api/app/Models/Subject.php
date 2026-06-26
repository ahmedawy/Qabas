<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subject';

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
        'NodeID' => 'integer',
        'IsColored' => 'boolean',
    ];

    /**
     * Get the parent subject node.
     *
     * @return BelongsTo<Subject, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Get the child subject nodes.
     *
     * @return HasMany<Subject, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID')->orderBy('ID');
    }

    /**
     * Get the Hadith links associated with this subject.
     *
     * @return HasMany<SubjectHit, $this>
     */
    public function hits(): HasMany
    {
        return $this->hasMany(SubjectHit::class, 'SubjectID', 'ID');
    }
}
