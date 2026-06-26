<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
 * @property string $Tarf
 */
class BookTocService extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'booktoc_services';

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
     * Get the parent node of this service entry.
     *
     * @return BelongsTo<BookTocService, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'ParentID', 'MainID');
    }

    /**
     * Get the children nodes of this service entry.
     *
     * @return HasMany<BookTocService, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'ParentID', 'MainID')->orderBy('MainID');
    }

    /**
     * Get descendant leaf nodes of a given chapter using a downward Recursive CTE.
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
                FROM booktoc_services
                WHERE MainID = ?
                
                UNION ALL
                
                SELECT child.MainID, child.BookID, child.BookName, child.ID, child.CleanContent, child.Annotations, child.ParentID, child.IsLeaf, child.PartNum, child.PageNum, parent.Level + 1 AS Level, CONCAT(parent.Path, ',', child.MainID) AS Path
                FROM booktoc_services child
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
     * @param self $serviceNode
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAncestors(self $serviceNode)
    {
        if (!$serviceNode->ParentID) {
            return new \Illuminate\Database\Eloquent\Collection();
        }

        $sql = "
            WITH RECURSIVE HierarchyCTE AS (
                SELECT *, 1 AS Level
                FROM booktoc_services
                WHERE MainID = ? AND IsLeaf = 0
                
                UNION ALL
                
                SELECT parent.*, child.Level + 1 AS Level
                FROM booktoc_services parent
                INNER JOIN HierarchyCTE child ON child.ParentID = parent.MainID
                WHERE parent.IsLeaf = 0
            )
            SELECT * FROM HierarchyCTE ORDER BY Level DESC
        ";

        $rawBreadcrumbs = \Illuminate\Support\Facades\DB::select($sql, [$serviceNode->ParentID]);
        return self::hydrate($rawBreadcrumbs);
    }
}
