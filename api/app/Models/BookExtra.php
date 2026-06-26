<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookExtra extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bookextra';

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
        'BookID' => 'integer',
        'RawyID' => 'integer',
        'Count' => 'integer',
    ];

    /**
     * Get the book this extra metadata is about.
     *
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'BookID', 'ID');
    }

    /**
     * Get the narrator linked to this extra metadata.
     *
     * @return BelongsTo<Narrator, $this>
     */
    public function narrator(): BelongsTo
    {
        return $this->belongsTo(Narrator::class, 'RawyID', 'ID');
    }
}
