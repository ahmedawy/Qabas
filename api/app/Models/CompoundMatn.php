<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $ID
 * @property int $HadithMainID
 * @property string $Matn
 * @property string|null $CleanMatn
 * @property array|null $MatnAnnotations
 * @property string $AsanedComp
 */
class CompoundMatn extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'hcompoundmatn';

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
        'HadithMainID' => 'integer',
        'MatnAnnotations' => 'json',
    ];

    /**
     * Get the Hadith paragraph this compound text is linked to.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'HadithMainID', 'MainID');
    }
}
