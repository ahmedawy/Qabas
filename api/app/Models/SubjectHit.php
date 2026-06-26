<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectHit extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'subjecthit';

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
        'SubjectID' => 'integer',
        'ParagraphMainID' => 'integer',
        'NodeID' => 'integer',
    ];

    /**
     * Get the subject category of this hit.
     *
     * @return BelongsTo<Subject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'SubjectID', 'ID');
    }

    /**
     * Get the Hadith paragraph of this hit.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function hadith(): BelongsTo
    {
        return $this->belongsTo(BookTocHadith::class, 'ParagraphMainID', 'MainID');
    }
}
