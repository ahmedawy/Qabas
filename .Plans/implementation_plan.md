# Offset Annotations Migration for `booktoc_hadith` (Revised)

Extract all proprietary XML tags from ~339,607 rows of Arabic text, store clean text in `CleanContent`, and persist structured annotation metadata as a JSON array of character offsets in `Annotations`.

## User Review Required

> [!IMPORTANT]
> **Non-destructive** — The original `Content` column is never modified. `CleanContent` and `Annotations` are new sibling columns. A full backup table is created before any schema change.

> [!IMPORTANT]
> **API Response is Additive** — `HadithDetailResource` will return `Content` + `CleanContent` + `Annotations`. `HadithSummaryResource` will return `CleanContent` only (no raw XML, no annotations). This is non-breaking; the frontend adopts the new fields at its own pace.

> [!WARNING]
> **Estimated Runtime** — Processing 339K rows at 1,000 rows/chunk with regex parsing will take roughly **15–25 minutes** on local XAMPP with PHP CLI. The script is **resumable**: it skips rows that already have `CleanContent` populated.

---

## Tag Inventory (from database scan)

Full scan of 276,353 rows containing `<` characters across the entire `booktoc_hadith` table:

| Tag Name | Occurrences | Has `ربط`? | FK Target Table | Notes |
|---|---|---|---|---|
| `راوي` | 1,720,385 | ✅ | `nouns` (Narrator) | Narrator highlight. Also has `اسم`, `نوع` attrs |
| `حديث` | 278,096 | ❌ | — | Structural: wraps entire hadith. Has `تخصيص`, `نوع` |
| `مسألة` | 276,353 | ❌ | — | Structural: top-level wrapper for every row |
| `طرف` | 269,644 | ❌ | — | Hadith summary snippet (tarf) |
| `متن` | 266,687 | ✅ | internal | Matn (hadith body text). Has `نوع` |
| `غريب` | 244,739 | ✅ | `lexiconitems` (LexiconItem) | Rare/unusual word highlight |
| `الصفحات` | 123,008 | ❌ | — | Self-closing page/volume marker. Has `جزء`, `صفحة` |
| `قول` | 82,429 | ✅ | internal | Scholar's commentary. Has `نوع` |
| `تكشيف` | 60,852 | ❌ | — | Chain classification marker. Has `نوع` |
| `سند` | 59,987 | ❌ | — | Structural: groups chain narrators. Has `نوع` |
| `مصطلح_صيغ` | 46,149 | ✅ | internal | Transmission terminology formula |
| `هامش` | 41,900 | ❌ | — | Footnote/margin note. Has `ID`, `نوع` |
| `آية` | 31,654 | ✅ | `quranayat` (QuranVerse) | Quran verse. Has `الآية`, `السورة`, `رقم_السورة` |
| `قرآن` | 29,338 | ❌ | — | Structural: wraps `<آية>` tags |
| `تعريف` | 12,815 | ❌ | — | Definition/explanation. Has `نوع` |
| `تفسير` | 7,446 | ❌ | — | Structural: exegesis section wrapper |
| `تواريخ` | 6,046 | ✅ | `matndates` (MatnDate) | Historical date reference |
| `علم` | 4,961 | ✅ | `nouns` (Narrator) | Named scholar (with critique). Has `نوع` |
| `فوائد` | 2,756 | ❌ | — | Scholarly benefit/note. Has `نوع` |
| `شعر` | 1,336 | ❌ | — | Structural: wraps poetry `<شطر_بيت>` |
| `زيادات` | 922 | ✅ | `nouns` (Narrator) | Textual addition by named narrator |
| `قراءة` | 278 | ✅ | internal | Quran recitation variant. Has `نوع` |
| `إدراج` | 73 | ❌ | — | Interpolation/insertion marker |

**Additional sub-tags found** (within parent tags, treated as annotations):

| Sub-tag | Context | Notes |
|---|---|---|
| `رقم_حديث` | Inside `<حديث>` | Hadith number. Has `نوع` |
| `رقم_الفقرة` | Inside `<مسألة>` | Self-closing paragraph ref. Has `ربط` |
| `صيغة_تحديث` | Inside `<مصطلح_صيغ>` | Transmission formula text |
| `شطر_بيت` | Inside `<شعر>` | Poetry half-line |
| `علم_رجل` | Inside `<متن>` | Named person (→ `nouns`) |
| `علم_مكان` | Inside `<متن>` | Named place (→ `lexiconitems`, `معجم="مكان"`) |
| `نوع_قراءة` | Inside `<قراءة>` | Recitation type variant |
| `مصطلح_متون` | Inside `<حديث>` | Matn terminology wrapper |
| `نص_مخفي` | Various | Self-closing hidden text. Has `نص` attr |
| `نه` | Various | Self-closing end-of-hadith marker |

---

## Annotation JSON Schema

Each element in the `Annotations` array:

```json
{
  "type": "string",         // Arabic tag name: "راوي", "غريب", "آية", etc.
  "start": "integer",       // 0-based character offset in CleanContent
  "length": "integer",      // character length of annotated span (0 for self-closing)
  "linkId": "integer|null", // value of ربط attribute, or null if absent
  "parentIndex": "integer|null", // index of parent annotation, or null if top-level
  "attrs": "object|null"    // all other attributes as key-value pairs, or null
}
```

**Full example** (simplified):

```
Original Content:
<مسألة><حديث نوع="مرفوع"><راوي ربط="3654" اسم="الحميدي" نوع="شيخ_المصنف">الْحُمَيْدِيّ</راوي> عن <غريب ربط="8130">صَلْصَلَةِ</غريب></حديث></مسألة>

CleanContent:
"الْحُمَيْدِيّ عن صَلْصَلَةِ"

Annotations:
[
  {"type":"مسألة",  "start":0,  "length":22, "linkId":null, "parentIndex":null, "attrs":null},
  {"type":"حديث",   "start":0,  "length":22, "linkId":null, "parentIndex":0,    "attrs":{"نوع":"مرفوع"}},
  {"type":"راوي",   "start":0,  "length":11, "linkId":3654, "parentIndex":1,    "attrs":{"اسم":"الحميدي","نوع":"شيخ_المصنف"}},
  {"type":"غريب",   "start":15, "length":7,  "linkId":8130, "parentIndex":1,    "attrs":null}
]
```

Self-closing tag example:
```json
{"type":"الصفحات", "start":42, "length":0, "linkId":null, "parentIndex":0, "attrs":{"جزء":"1","صفحة":"6"}}
```

---

## Proposed Changes

### Phase 1: Backup & Schema Migration

#### [NEW] [2026_06_23_200000_add_annotation_columns_to_booktoc_hadith.php](file:///d:/xampp/htdocs/Hadith/api/database/migrations/2026_06_23_200000_add_annotation_columns_to_booktoc_hadith.php)

A Laravel migration that:
1. **Creates a full backup** table `booktoc_hadith_Backup_20260623` using `CREATE TABLE ... LIKE` + `INSERT INTO ... SELECT *`.
2. **Adds two columns** to the live `booktoc_hadith` table:

```sql
-- Step 1: Backup
CREATE TABLE booktoc_hadith_Backup_20260623 LIKE booktoc_hadith;
INSERT INTO booktoc_hadith_Backup_20260623 SELECT * FROM booktoc_hadith;

-- Step 2: Alter
ALTER TABLE booktoc_hadith
  ADD COLUMN CleanContent MEDIUMTEXT NULL AFTER Content,
  ADD COLUMN Annotations  JSON       NULL AFTER CleanContent;
```

The `down()` method drops the two new columns but **does NOT drop the backup table** (manual cleanup only after full validation).

---

### Phase 2: Tag Type Configuration & API Endpoint

#### [NEW] [tag-types.php](file:///d:/xampp/htdocs/Hadith/api/config/tag-types.php)

A Laravel config file containing the tag-to-table FK mapping and metadata for all 33 tag types (23 primary + 10 sub-tags). This is the **single source of truth** used by both the migration command and the API endpoint.

```php
return [
    'راوي'       => ['linkTable' => 'narrator', 'category' => 'inline'],
    'غريب'       => ['linkTable' => 'lexicon',  'category' => 'inline'],
    'آية'        => ['linkTable' => 'quran_verse', 'category' => 'inline'],
    'تواريخ'     => ['linkTable' => 'matn_date', 'category' => 'inline'],
    'علم'        => ['linkTable' => 'narrator',  'category' => 'inline'],
    'علم_رجل'    => ['linkTable' => 'narrator',  'category' => 'inline'],
    'علم_مكان'   => ['linkTable' => 'lexicon',   'category' => 'inline'],
    'زيادات'     => ['linkTable' => 'narrator',  'category' => 'inline'],
    'متن'        => ['linkTable' => null,        'category' => 'structural'],
    'حديث'       => ['linkTable' => null,        'category' => 'structural'],
    'مسألة'      => ['linkTable' => null,        'category' => 'structural'],
    // ... all 33 entries
];
```

---

#### [NEW] [GetTagTypesController.php](file:///d:/xampp/htdocs/Hadith/api/app/Http/Controllers/Api/V1/GetTagTypesController.php)

A lightweight controller that returns the tag types config:

```php
public function __invoke(): JsonResponse
{
    return response()->json([
        'success' => true,
        'data' => config('tag-types'),
    ]);
}
```

---

#### [MODIFY] [api.php](file:///d:/xampp/htdocs/Hadith/api/routes/api.php)

Add the new route:
```php
$router->get('/tag_types', GetTagTypesController::class);
```

---

### Phase 3: Data Migration (Artisan CLI Command)

#### [NEW] [MigrateAnnotations.php](file:///d:/xampp/htdocs/Hadith/api/app/Console/Commands/MigrateAnnotations.php)

A Laravel Artisan command `hadith:migrate-annotations` designed for PHP CLI execution.

**Core Algorithm** — A recursive descent parser that processes the XML structure while tracking character positions in the clean output:

```
1. Walk through the Content string character by character
2. When a tag opening `<` is encountered:
   a. Parse the tag name and attributes
   b. If self-closing (`/>`): emit a zero-length annotation at current position
   c. If opening tag: push onto a stack, record start position
   d. If closing tag (`</`): pop from stack, finalize annotation with computed length
3. Non-tag text: append to CleanContent, advance character position
4. After processing: write CleanContent + JSON annotations array to DB
```

**Memory & Resilience Strategy:**

| Concern | Solution |
|---|---|
| 339K rows | `->orderBy('MainID')->chunk(1000, ...)` |
| Memory | `gc_collect_cycles()` after every chunk; `select('MainID', 'Content')` only |
| Resumability | `WHERE CleanContent IS NULL` — already-processed rows skipped |
| Timeout | `set_time_limit(0)` — CLI mode, explicitly disabled |
| Multibyte | All offsets via `mb_strlen($str, 'UTF-8')` — never `strlen` |
| Progress | Console progress bar: `[=====> ] 145,000 / 339,607` |
| Atomicity | Each chunk in a DB transaction — partial failures don't corrupt |
| Nesting | Stack-based parser tracks `parentIndex` for nested tags |

**Regex Patterns:**

```php
// Match opening tags (including underscore in names)
$openTag = '/<([\x{0600}-\x{06FF}\x{0750}-\x{077F}_]+)((?:\s[^>]*?)?)(\/?)\s*>/u';

// Match closing tags
$closeTag = '/<\/([\x{0600}-\x{06FF}\x{0750}-\x{077F}_]+)\s*>/u';

// Extract individual attributes
$attrPattern = '/([\x{0600}-\x{06FF}\x{0750}-\x{077F}_]+)\s*=\s*"([^"]*)"/u';
```

**Command Signature:**
```
php artisan hadith:migrate-annotations
    {--chunk=1000 : Rows per batch}
    {--dry-run : Parse and display stats without writing to DB}
```

---

### Phase 4: Model & API Resource Updates

#### [MODIFY] [BookTocHadith.php](file:///d:/xampp/htdocs/Hadith/api/app/Models/BookTocHadith.php)

- Add `CleanContent` and `Annotations` to the `@property` docblock.
- Add `'Annotations' => 'json'` to the `$casts` array.

---

#### [MODIFY] [HadithDetailResource.php](file:///d:/xampp/htdocs/Hadith/api/app/Http/Resources/HadithDetailResource.php)

Add the two new fields (additive, non-breaking):
```php
'Content'      => $this->resource->Content,       // preserved
'CleanContent' => $this->resource->CleanContent,   // NEW
'Annotations'  => $this->resource->Annotations,    // NEW
```

---

#### [MODIFY] [HadithSummaryResource.php](file:///d:/xampp/htdocs/Hadith/api/app/Http/Resources/HadithSummaryResource.php)

Replace `Content` with `CleanContent` for list views (no annotations, keep payload light):
```php
'CleanContent' => $this->resource->CleanContent,   // replaces Content
```

---

### Phase 5: Search Compatibility

#### [MODIFY] [SearchHadithsController.php](file:///d:/xampp/htdocs/Hadith/api/app/Http/Controllers/Api/V1/SearchHadithsController.php)

Search against `CleanContent` with a `COALESCE` fallback for rows not yet migrated:
```php
$query->whereRaw(
    'normalize_arabic(COALESCE(CleanContent, Content)) LIKE normalize_arabic(?)',
    ['%'.$q.'%']
);
```

---

## Execution Order

| Step | Action | Command |
|------|--------|---------|
| 1 | Start MySQL | `D:\xampp\mysql_start.bat` |
| 2 | Run schema migration (backup + ALTER) | `cd /d D:\xampp\htdocs\Hadith\api && D:\xampp\php\php.exe artisan migrate` |
| 3 | Verify backup row count | `D:\xampp\php\php.exe artisan tinker --execute="..."` |
| 4 | Run data migration (dry-run) | `D:\xampp\php\php.exe artisan hadith:migrate-annotations --dry-run` |
| 5 | Run data migration (live) | `D:\xampp\php\php.exe artisan hadith:migrate-annotations` |
| 6 | Verify data integrity | See Verification Plan below |
| 7 | Test API endpoints | `curl.exe` smoke tests |

---

## Files Changed Summary

| File | Action | Purpose |
|---|---|---|
| `database/migrations/2026_06_23_200000_...php` | NEW | Backup table + schema ALTER |
| `config/tag-types.php` | NEW | Tag type → FK table mapping config |
| `app/Console/Commands/MigrateAnnotations.php` | NEW | Chunked CLI data migration |
| `app/Http/Controllers/Api/V1/GetTagTypesController.php` | NEW | `GET /tag_types` endpoint |
| `app/Models/BookTocHadith.php` | MODIFY | Add casts + docblock |
| `app/Http/Resources/HadithDetailResource.php` | MODIFY | Expose CleanContent + Annotations |
| `app/Http/Resources/HadithSummaryResource.php` | MODIFY | Expose CleanContent |
| `app/Http/Controllers/Api/V1/SearchHadithsController.php` | MODIFY | Search against CleanContent |
| `routes/api.php` | MODIFY | Add `/tag_types` route |

---

## Verification Plan

### Automated Tests

1. **Backup parity**:
   ```sql
   SELECT
     (SELECT COUNT(*) FROM booktoc_hadith) AS live,
     (SELECT COUNT(*) FROM booktoc_hadith_Backup_20260623) AS backup;
   ```

2. **Migration completeness** (zero un-migrated rows):
   ```sql
   SELECT COUNT(*) FROM booktoc_hadith WHERE Content IS NOT NULL AND CleanContent IS NULL;
   ```

3. **No XML residue in CleanContent**:
   ```php
   // In tinker: check a sample of 1000 rows for any remaining < characters
   DB::table('booktoc_hadith')->whereNotNull('CleanContent')
     ->where('CleanContent', 'LIKE', '%<%')->count();
   ```

4. **JSON validity**:
   ```sql
   SELECT COUNT(*) FROM booktoc_hadith
   WHERE Annotations IS NOT NULL AND JSON_VALID(Annotations) = 0;
   ```

5. **API smoke tests**:
   ```bash
   curl.exe -s "http://localhost/Hadith/api/public/api/v1/hadith?id=6"
   curl.exe -s "http://localhost/Hadith/api/public/api/v1/tag_types"
   ```

6. **Offset accuracy spot-check** — verify that `mb_substr(CleanContent, start, length)` reproduces the original tagged text for 5 sample rows.

### Manual Verification
- Open 3–5 hadiths known to contain `<راوي>`, `<غريب>`, and `<آية>` tags.
- Confirm `CleanContent` reads naturally without artifacts.
- Verify annotation offsets index back into `CleanContent` correctly.
