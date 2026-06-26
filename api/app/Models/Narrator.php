<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property string|null $Name
 * @property string|null $AbbName
 * @property string|null $Kunia
 * @property string|null $Laqab
 * @property string|null $Nasab
 * @property string|null $Tabaqa
 * @property int|null $TabaqaNum
 * @property string|null $BirthYear
 * @property string|null $DeathYear
 * @property int|null $DeathYearNum
 * @property string|null $MartabaIbnHajar
 * @property string|null $MartabaZahabi
 * @property string|null $LivingCity
 * @property string|null $DeathCity
 * @property string|null $EsmShuhra
 * @property bool $IsRawy
 * @property int $HadithsCount
 */
class Narrator extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'nouns';

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
        'TabaqaNum' => 'integer',
        'DeathYearNum' => 'integer',
        'HadithsCount' => 'integer',
        'IsRawy' => 'boolean',
        'IsScientist' => 'boolean',
        'IsNoun' => 'boolean',
        'IsForWork' => 'boolean',
        'IsMobham' => 'boolean',
        'IsHasRwaya' => 'boolean',
    ];

    /**
     * Get the teachers of this narrator.
     *
     * @return BelongsToMany<Narrator, $this>
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'nounsshyoukhtalamize',
            'RawyID',     // Narrator ID
            'ShyoukhID'   // Teacher ID
        );
    }

    /**
     * Get the students of this narrator.
     *
     * @return BelongsToMany<Narrator, $this>
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'nounsshyoukhtalamize',
            'ShyoukhID',  // Teacher ID (which is this narrator)
            'RawyID'      // Student ID
        );
    }

    /**
     * Get the books associated with this narrator.
     *
     * @return BelongsToMany<Book, $this>
     */
    public function books(): BelongsToMany
    {
        return $this->belongsToMany(
            Book::class,
            'nounsbooks',
            'RawyID',     // Narrator ID
            'BookID'      // Book ID
        );
    }

    /**
     * Get the critique reports/opinions about this narrator.
     *
     * @return HasMany<NarratorScientistSay, $this>
     */
    public function scholarlyOpinions(): HasMany
    {
        return $this->hasMany(NarratorScientistSay::class, 'RawyID', 'ID');
    }

    /**
     * Get the name wording forms for this narrator.
     *
     * @return HasMany<NarratorNameForm, $this>
     */
    public function nameForms(): HasMany
    {
        return $this->hasMany(NarratorNameForm::class, 'RawyID', 'ID');
    }

    /**
     * Get the special relations / classifications for this narrator.
     *
     * @return HasMany<NarratorRelation, $this>
     */
    public function specialRelations(): HasMany
    {
        return $this->hasMany(NarratorRelation::class, 'FirstRawyID', 'ID');
    }

    /**
     * Get the translation / biography sources for this narrator.
     *
     * @return HasMany<NarratorTranslation, $this>
     */
    public function translationSources(): HasMany
    {
        return $this->hasMany(NarratorTranslation::class, 'NounID', 'ID');
    }
}
