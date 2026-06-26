<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class LexiconItem extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lexiconitems';

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
        'LexiconID' => 'integer',
        'ParentID' => 'integer',
        'IsLeaf' => 'integer',
        'LinkID' => 'integer',
        'ResultsCount' => 'integer',
    ];

    /**
     * Get the parent lexicon category.
     *
     * @return BelongsTo<LexiconItem, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'ID');
    }

    /**
     * Get the child lexicon terms.
     *
     * @return HasMany<LexiconItem, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'ID')->orderBy('ID');
    }

    /**
     * Get the descriptions/definitions linked to this term.
     *
     * @return HasMany<LexiconDescription, $this>
     */
    public function descriptions(): HasMany
    {
        return $this->hasMany(LexiconDescription::class, 'LexiconItemID', 'ID');
    }

    /**
     * Get the service content paragraphs defining this term.
     *
     * @return HasManyThrough<BookTocService, LexiconDescription, $this>
     */
    public function definitions(): HasManyThrough
    {
        return $this->hasManyThrough(
            BookTocService::class,
            LexiconDescription::class,
            'LexiconItemID', // FK on LexiconDescription pointing to LexiconItem
            'MainID',        // FK on BookTocService pointing to LexiconDescription
            'ID',            // Local key on LexiconItem
            'DescrpMainID'   // Local key on LexiconDescription pointing to BookTocService
        );
    }
}
