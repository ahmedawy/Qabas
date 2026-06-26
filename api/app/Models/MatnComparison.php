<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatnComparison extends Model
{
    /**
     * The default table associated with the model.
     *
     * @var string
     */
    protected $table = 'hmatncomparison1';

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
        'MasterMatnID' => 'integer',
        'SlaveMatnID' => 'integer',
        'MatchSort' => 'integer',
    ];

    /**
     * Dynamically bind this model to a specific book's comparison table.
     */
    public static function forBook(int $bookId): self
    {
        $instance = new self;
        $instance->setTable('hmatncomparison'.$bookId);

        return $instance;
    }

    /**
     * Get a query builder instance pre-bound to a specific book's comparison table.
     *
     * @return Builder<MatnComparison>
     */
    public static function queryForBook(int $bookId): Builder
    {
        return self::forBook($bookId)->newQuery();
    }

    /**
     * Get the master Hadith text of this comparison.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function masterHadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'MasterMatnID', 'MainID');
    }

    /**
     * Get the slave Hadith text of this comparison.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function slaveHadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'SlaveMatnID', 'MainID');
    }
}
