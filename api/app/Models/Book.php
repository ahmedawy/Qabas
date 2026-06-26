<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $ID
 * @property string $Title
 * @property string $Summary
 * @property int $AuthorID
 * @property Author|null $author
 */
class Book extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'book';

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
        'AuthorID' => 'integer',
        'MousanefID' => 'integer',
        'Strong' => 'integer',
        'Fame' => 'integer',
        'Tarteeb' => 'integer',
        'DefaultHadith' => 'integer',
        'TakhreejAuthorDeathDate' => 'integer',
    ];

    /**
     * Get the author of the book.
     *
     * @return BelongsTo<Author, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class, 'AuthorID', 'ID');
    }

    /**
     * Get the table of contents and hadith entries for this book.
     *
     * @return HasMany<BookTocHadith, $this>
     */
    public function tocEntries(): HasMany
    {
        return $this->hasMany(BookTocHadith::class, 'BookID', 'ID');
    }
}
