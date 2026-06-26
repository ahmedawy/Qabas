<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * @property int $MainID
 * @property int $BookID
 * @property string $BookName
 * @property int $ID
 * @property string $Content
 * @property string|null $CleanContent
 * @property array|null $Annotations
 * @property int|null $ParentID
 * @property bool $IsLeaf
 * @property bool $IsParagraph
 * @property int $ParagraphID
 * @property int|null $NextParagraphID
 * @property int|null $PrevParagraphID
 * @property string $SectionText
 * @property string $ChapterText
 * @property int $PartNum
 * @property int $PageNum
 * @property string $BooksTakhreej
 * @property string $Tarf
 * @property string $TarqeemHarf
 * @property string $TarqeemMatboa1
 * @property string $TarqeemMatboa2
 * @property int $MosanefID
 */
class BookTocHadith extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booktoc_hadith';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'MainID';

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
        'MainID' => 'integer',
        'BookID' => 'integer',
        'ID' => 'integer',
        'ParentID' => 'integer',
        'IsLeaf' => 'boolean',
        'IsParagraph' => 'boolean',
        'ParagraphID' => 'integer',
        'NextParagraphID' => 'integer',
        'PrevParagraphID' => 'integer',
        'PartNum' => 'integer',
        'PageNum' => 'integer',
        'MosanefID' => 'integer',
        'Annotations' => 'json',
    ];

    /**
     * Get the book this entry belongs to.
     *
     * @return BelongsTo<Book, $this>
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'BookID', 'ID');
    }

    /**
     * Get the parent TOC node for this entry.
     *
     * @return BelongsTo<BookTocHadith, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'MainID');
    }

    /**
     * Get the child TOC nodes or hadith paragraphs.
     *
     * @return HasMany<BookTocHadith, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'MainID')->orderBy('MainID');
    }

    /**
     * Get the narrator chain links associated with this Hadith.
     *
     * @return HasMany<AsanedHadith, $this>
     */
    public function chainLinks(): HasMany
    {
        return $this->hasMany(AsanedHadith::class, 'HadithMainID', 'MainID');
    }

    /**
     * Get the transmission chains associated with this Hadith.
     *
     * @return HasManyThrough<TransmissionChain, AsanedHadith, $this>
     */
    public function transmissionChains(): HasManyThrough
    {
        return $this->hasManyThrough(
            TransmissionChain::class,
            AsanedHadith::class,
            'HadithMainID', // FK on AsanedHadith table linking to BookTocHadith
            'ID',           // FK on TransmissionChain table linking to AsanedHadith
            'MainID',       // Local key on BookTocHadith
            'SanadID'       // Local key on AsanedHadith linking to TransmissionChain
        );
    }

    /**
     * Get descendant leaf nodes (hadiths) of a given chapter using a downward Recursive CTE.
     *
     * @param int $chapterId
     * @param int $limit
     * @param int $offset
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getDescendantLeaves(int $chapterId, int $limit = 50, int $offset = 0)
    {
        $sql = "
            WITH RECURSIVE HierarchyCTE AS (
                SELECT MainID, BookID, BookName, ID, CleanContent, Annotations, ParentID, IsLeaf, PartNum, PageNum, 1 AS Level, CAST(MainID AS CHAR(1000)) AS Path
                FROM booktoc_hadith
                WHERE MainID = ?
                
                UNION ALL
                
                SELECT child.MainID, child.BookID, child.BookName, child.ID, child.CleanContent, child.Annotations, child.ParentID, child.IsLeaf, child.PartNum, child.PageNum, parent.Level + 1 AS Level, CONCAT(parent.Path, ',', child.MainID) AS Path
                FROM booktoc_hadith child
                INNER JOIN HierarchyCTE parent ON child.ParentID = parent.MainID
            )
            SELECT MainID, BookID, BookName, ID, CleanContent, Annotations, ParentID, IsLeaf, PartNum, PageNum FROM HierarchyCTE WHERE IsLeaf = 1 ORDER BY Path LIMIT ? OFFSET ?
        ";

        $rawResults = \Illuminate\Support\Facades\DB::select($sql, [$chapterId, $limit, $offset]);
        return self::hydrate($rawResults);
    }

    /**
     * Get ancestor breadcrumbs from a node up to the root using an upward Recursive CTE.
     *
     * @param self $hadith
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAncestors(self $hadith)
    {
        if (!$hadith->ParentID) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        $sql = "
            WITH RECURSIVE HierarchyCTE AS (
                SELECT *, 1 AS Level
                FROM booktoc_hadith
                WHERE MainID = ? AND IsLeaf = 0
                
                UNION ALL
                
                SELECT parent.*, child.Level + 1 AS Level
                FROM booktoc_hadith parent
                INNER JOIN HierarchyCTE child ON child.ParentID = parent.MainID
                WHERE parent.IsLeaf = 0
            )
            SELECT * FROM HierarchyCTE ORDER BY Level DESC
        ";

        $rawBreadcrumbs = \Illuminate\Support\Facades\DB::select($sql, [$hadith->ParentID]);
        return self::hydrate($rawBreadcrumbs);
    }
}
