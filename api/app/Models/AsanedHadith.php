<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $HadithMainID
 * @property int $BookID
 * @property int $SanadID
 * @property int $SanadType
 * @property int $SanadTahdethID
 * @property-read TransmissionChain|null $chain
 */
class AsanedHadith extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'asanedhadiths';

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
        'HadithMainID' => 'integer',
        'BookID' => 'integer',
        'SanadID' => 'integer',
        'SanadType' => 'integer',
        'SanadTahdethID' => 'integer',
    ];

    /**
     * Get the Hadith text associated with this link.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'HadithMainID', 'MainID');
    }

    /**
     * Get the transmission chain associated with this link.
     *
     * @return BelongsTo<TransmissionChain, $this>
     */
    public function chain(): BelongsTo
    {
        return $this->belongsTo(TransmissionChain::class, 'SanadID', 'ID');
    }
}
