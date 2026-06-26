# Database Usage Report

This report lists every table and column in the database, mapping them to file locations where they are used.

## Table: `﻿TABLE_NAME`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `COLUMN_NAME` | N/A | **Possibly Unused** |

---
## Table: `amthal`
**Used in (11 places):**
- api/app/Models/Proverb.php:16
- api/routes/api.php:98
- spa/dist/assets/index-DyjNWy-k.js:9
- spa/dist/assets/index-DyjNWy-k.js:15
- spa/dist/assets/index-DyjNWy-k.js:18
- ... and 6 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `annotation_links`
**Used in (17 places):**
- api/app/Console/Commands/PopulateAnnotationLinks.php:24
- api/app/Console/Commands/PopulateAnnotationLinks.php:35
- api/app/Console/Commands/PopulateAnnotationLinks.php:36
- api/app/Console/Commands/PopulateAnnotationLinks.php:41
- api/app/Console/Commands/PopulateAnnotationLinks.php:46
- ... and 12 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `source_table` | api/app/Console/Commands/PopulateAnnotationLinks.php:61, api/app/Console/Commands/PopulateAnnotationLinks.php:73, api/app/Console/Commands/PopulateAnnotationLinks.php:97 (+6 more) | Used |
| `source_id` | api/app/Console/Commands/PopulateAnnotationLinks.php:61, api/app/Console/Commands/PopulateAnnotationLinks.php:74, api/app/Console/Commands/PopulateAnnotationLinks.php:98 (+6 more) | Used |
| `tag_type` | api/app/Console/Commands/PopulateAnnotationLinks.php:60, api/app/Console/Commands/PopulateAnnotationLinks.php:99, api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:67 (+5 more) | Used |
| `link_id` | api/app/Console/Commands/PopulateAnnotationLinks.php:60, api/app/Console/Commands/PopulateAnnotationLinks.php:100, api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:68 (+5 more) | Used |

---
## Table: `asaned`
**Used in (4 places):**
- api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:58
- api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:60
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:101
- api/app/Models/TransmissionChain.php:24

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `SandRwah` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:60, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:102, api/app/Http/Resources/ChainResource.php:27 (+5 more) | Used |
| `SandTypes` | api/app/Models/TransmissionChain.php:14 | Used |
| `HadithsCount` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:135, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:136, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:142 (+30 more) | Used |

---
## Table: `asanedhadiths`
**Used in (8 places):**
- api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57
- api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:58
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:105
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:107
- api/app/Models/AsanedHadith.php:26
- ... and 3 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |
| `SanadID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:58, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:106, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:33 (+28 more) | Used |
| `SanadType` | api/app/Http/Resources/ChainResource.php:25, api/app/Models/AsanedHadith.php:15, api/app/Models/AsanedHadith.php:51 (+3 more) | Used |
| `SanadTahdethID` | api/app/Http/Resources/ChainResource.php:26, api/app/Models/AsanedHadith.php:16, api/app/Models/AsanedHadith.php:52 (+1 more) | Used |

---
## Table: `asanedrelations`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `SandID` | N/A | **Possibly Unused** |
| `RelationID` | N/A | **Possibly Unused** |
| `Rwah` | spa/src/features/statistics/StatisticsHub.tsx:22 | Used |

---
## Table: `asanedrelationstypes`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `asanedtahdeth`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `SandTahdeth` | N/A | **Possibly Unused** |

---
## Table: `asanedtahdethtypes`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `asanedtree`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `LeftValue` | api/app/Http/Resources/TocNodeResource.php:29, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |
| `RightValue` | api/app/Http/Resources/TocNodeResource.php:30, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `isMarfoa` | N/A | **Possibly Unused** |
| `isMawkof` | N/A | **Possibly Unused** |
| `isMaktoa` | N/A | **Possibly Unused** |
| `isMarfoaHokm` | N/A | **Possibly Unused** |

---
## Table: `asanedtypes`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `authors`
**Used in (1 places):**
- api/app/Models/Author.php:24

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `ShortName` | api/app/Http/Resources/BookResource.php:28, api/app/Models/Author.php:13 | Used |
| `DeathDate` | api/app/Http/Resources/BookResource.php:29, api/app/Models/Author.php:14, api/app/Models/Author.php:54 | Used |
| `Information` | api/app/Models/Author.php:15, api/config/database.php:125, api/config/queue.php:85 (+1 more) | Used |

---
## Table: `book`
**Used in (129 places):**
- api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:33
- api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:36
- api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:58
- api/app/Http/Controllers/Api/V1/GetBooksController.php:9
- api/app/Http/Controllers/Api/V1/GetBooksController.php:15
- ... and 124 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Title` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:67, api/app/Http/Controllers/Api/V1/GetControversialController.php:49, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:74 (+144 more) | Used |
| `Summary` | api/app/Http/Resources/BookResource.php:26, api/app/Models/Book.php:14, spa/dist/assets/index-DyjNWy-k.js:9 (+4 more) | Used |
| `AuthorID` | api/app/Http/Resources/BookResource.php:27, api/app/Models/Author.php:64, api/app/Models/Book.php:15 (+3 more) | Used |
| `MousanefID` | api/app/Models/Book.php:56 | Used |
| `Strong` | api/app/Models/Book.php:57 | Used |
| `Fame` | api/app/Models/Book.php:58 | Used |
| `Tarteeb` | api/app/Models/Book.php:59 | Used |
| `TakhreejBook` | N/A | **Possibly Unused** |
| `TakhreejAuthor` | N/A | **Possibly Unused** |
| `TakhreejAuthorDeathDate` | api/app/Models/Book.php:61 | Used |
| `DefaultHadith` | api/app/Models/Book.php:60 | Used |
| `CardInformation` | N/A | **Possibly Unused** |
| `Print1Edition` | N/A | **Possibly Unused** |
| `Print2Edition` | N/A | **Possibly Unused** |
| `PartPageEdition` | N/A | **Possibly Unused** |

---
## Table: `bookextra`
**Used in (10 places):**
- api/app/Http/Controllers/Api/V1/GetRwahExtraController.php:8
- api/app/Http/Controllers/Api/V1/GetRwahExtraController.php:14
- api/app/Http/Controllers/Api/V1/GetRwahExtraController.php:19
- api/app/Http/Controllers/Api/V1/GetRwahExtraController.php:41
- api/app/Http/Controllers/Api/V1/GetRwahExtraController.php:42
- ... and 5 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `RawyName` | api/app/Http/Resources/ScholarOpinionResource.php:25, spa/dist/assets/index-DyjNWy-k.js:12, spa/src/features/narrators/NarratorHub.tsx:591 (+1 more) | Used |
| `Count` | api/app/Console/Commands/MigrateAnnotations.php:67, api/app/Console/Commands/MigrateAnnotations.php:72, api/app/Console/Commands/MigrateAnnotations.php:120 (+29 more) | Used |

---
## Table: `bookmarks`
**Used in (34 places):**
- api/app/Http/Controllers/Api/V1/GetBookmarksController.php:26
- api/app/Http/Controllers/Api/V1/GetBookmarksController.php:35
- api/app/Http/Controllers/Api/V1/GetBookmarksController.php:41
- api/app/Http/Controllers/Api/V1/GetBookmarksController.php:45
- api/app/Models/User.php:42
- ... and 29 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `user_id` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:36, api/app/Http/Controllers/Api/V1/ToggleBookmarkController.php:55, api/app/Http/Controllers/Api/V1/ToggleBookmarkController.php:65 (+4 more) | Used |
| `hadith_main_id` | api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:29, api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:29 (+13 more) | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |
| `updated_at` | N/A | **Possibly Unused** |

---
## Table: `booktoc_hadith`
**Used in (75 places):**
- api/app/Console/Commands/MigrateAnnotations.php:19
- api/app/Console/Commands/MigrateAnnotations.php:30
- api/app/Console/Commands/PopulateAnnotationLinks.php:24
- api/app/Console/Commands/PopulateAnnotationLinks.php:51
- api/app/Console/Commands/PopulateAnnotationLinks.php:52
- ... and 70 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MainID` | api/test_mainid.php:8, api/app/Console/Commands/MigrateAnnotations.php:21, api/app/Console/Commands/PopulateAnnotationLinks.php:53 (+168 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |
| `BookName` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:47, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:76, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:62 (+103 more) | Used |
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `CleanContent` | api/app/Console/Commands/MigrateAnnotations.php:48, api/app/Console/Commands/MigrateAnnotations.php:104, api/app/Console/Commands/MigrateAnnotations.php:134 (+84 more) | Used |
| `Annotations` | api/app/Console/Commands/MigrateAnnotations.php:18, api/app/Console/Commands/MigrateAnnotations.php:30, api/app/Console/Commands/MigrateAnnotations.php:49 (+123 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `IsParagraph` | api/app/Models/BookTocHadith.php:22, api/app/Models/BookTocHadith.php:78, api/app/Models/BookTocService.php:21 (+1 more) | Used |
| `ParagraphID` | api/app/Models/BookTocHadith.php:23, api/app/Models/BookTocHadith.php:79, api/app/Models/BookTocService.php:22 (+1 more) | Used |
| `NextParagraphID` | api/app/Models/BookTocHadith.php:24, api/app/Models/BookTocHadith.php:80, api/app/Models/BookTocService.php:23 (+1 more) | Used |
| `PrevParagraphID` | api/app/Models/BookTocHadith.php:25, api/app/Models/BookTocHadith.php:81, api/app/Models/BookTocService.php:24 (+1 more) | Used |
| `SectionText` | api/app/Models/BookTocHadith.php:26, api/app/Models/BookTocService.php:25 | Used |
| `ChapterText` | api/app/Models/BookTocHadith.php:27, api/app/Models/BookTocService.php:26 | Used |
| `PartNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:49, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:78, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:64 (+72 more) | Used |
| `PageNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:50, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:79, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:65 (+72 more) | Used |
| `BooksTakhreej` | api/app/Models/BookTocHadith.php:30 | Used |
| `Tarf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:46, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:61, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:66 (+35 more) | Used |
| `TarqeemHarf` | api/app/Http/Controllers/Api/V1/GetHadithByNumberController.php:39, api/app/Http/Resources/HadithDetailResource.php:33, api/app/Models/BookTocHadith.php:32 (+4 more) | Used |
| `TarqeemMatboa1` | api/app/Http/Controllers/Api/V1/GetHadithByNumberController.php:39, api/app/Models/BookTocHadith.php:33, spa/dist/assets/index-DyjNWy-k.js:9 (+1 more) | Used |
| `TarqeemMatboa2` | api/app/Http/Controllers/Api/V1/GetHadithByNumberController.php:39, api/app/Models/BookTocHadith.php:34, spa/dist/assets/index-DyjNWy-k.js:9 (+1 more) | Used |
| `MosanefID` | api/app/Models/BookTocHadith.php:35, api/app/Models/BookTocHadith.php:84 | Used |

---
## Table: `booktoc_services`
**Used in (45 places):**
- api/app/Console/Commands/MigrateAnnotations.php:30
- api/app/Console/Commands/PopulateAnnotationLinks.php:24
- api/app/Console/Commands/PopulateAnnotationLinks.php:55
- api/app/Console/Commands/PopulateAnnotationLinks.php:56
- api/app/Console/Commands/PopulateAnnotationLinks.php:57
- ... and 40 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MainID` | api/test_mainid.php:8, api/app/Console/Commands/MigrateAnnotations.php:21, api/app/Console/Commands/PopulateAnnotationLinks.php:53 (+168 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |
| `BookName` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:47, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:76, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:62 (+103 more) | Used |
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `CleanContent` | api/app/Console/Commands/MigrateAnnotations.php:48, api/app/Console/Commands/MigrateAnnotations.php:104, api/app/Console/Commands/MigrateAnnotations.php:134 (+84 more) | Used |
| `Annotations` | api/app/Console/Commands/MigrateAnnotations.php:18, api/app/Console/Commands/MigrateAnnotations.php:30, api/app/Console/Commands/MigrateAnnotations.php:49 (+123 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `IsParagraph` | api/app/Models/BookTocHadith.php:22, api/app/Models/BookTocHadith.php:78, api/app/Models/BookTocService.php:21 (+1 more) | Used |
| `ParagraphID` | api/app/Models/BookTocHadith.php:23, api/app/Models/BookTocHadith.php:79, api/app/Models/BookTocService.php:22 (+1 more) | Used |
| `NextParagraphID` | api/app/Models/BookTocHadith.php:24, api/app/Models/BookTocHadith.php:80, api/app/Models/BookTocService.php:23 (+1 more) | Used |
| `PrevParagraphID` | api/app/Models/BookTocHadith.php:25, api/app/Models/BookTocHadith.php:81, api/app/Models/BookTocService.php:24 (+1 more) | Used |
| `SectionText` | api/app/Models/BookTocHadith.php:26, api/app/Models/BookTocService.php:25 | Used |
| `ChapterText` | api/app/Models/BookTocHadith.php:27, api/app/Models/BookTocService.php:26 | Used |
| `PartNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:49, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:78, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:64 (+72 more) | Used |
| `PageNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:50, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:79, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:65 (+72 more) | Used |
| `Tarf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:46, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:61, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:66 (+35 more) | Used |

---
## Table: `cache`
**Used in (27 places):**
- api/config/app.php:116
- api/config/app.php:119
- api/config/cache.php:11
- api/config/cache.php:14
- api/config/cache.php:16
- ... and 22 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `key` | api/app/Console/Commands/MigrateAnnotations.php:21, api/app/Console/Commands/MigrateAnnotations.php:39, api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:35 (+165 more) | Used |
| `value` | api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:55, api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:56, api/config/app.php:12 (+118 more) | Used |
| `expiration` | api/config/sanctum.php:46, api/config/sanctum.php:55, api/database/migrations/0001_01_01_000001_create_cache_table.php:19 (+1 more) | Used |

---
## Table: `cache_locks`
**Used in (2 places):**
- api/database/migrations/0001_01_01_000001_create_cache_table.php:22
- api/database/migrations/0001_01_01_000001_create_cache_table.php:35

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `key` | api/app/Console/Commands/MigrateAnnotations.php:21, api/app/Console/Commands/MigrateAnnotations.php:39, api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:35 (+165 more) | Used |
| `owner` | api/database/migrations/0001_01_01_000001_create_cache_table.php:24 | Used |
| `expiration` | api/config/sanctum.php:46, api/config/sanctum.php:55, api/database/migrations/0001_01_01_000001_create_cache_table.php:19 (+1 more) | Used |

---
## Table: `exprawymodbaj`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `PrID` | N/A | **Possibly Unused** |
| `ShyoukhID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:134, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:140, api/app/Models/Narrator.php:90 (+1 more) | Used |
| `ShName` | N/A | **Possibly Unused** |
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `RName` | N/A | **Possibly Unused** |

---
## Table: `failed_jobs`
**Used in (4 places):**
- api/config/queue.php:111
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:31
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:39
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:57

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `uuid` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:41 | Used |
| `connection` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:39, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:46, api/app/Http/Controllers/Api/V1/GetStatsAtrafController.php:30 (+25 more) | Used |
| `queue` | api/config/queue.php:9, api/config/queue.php:12, api/config/queue.php:14 (+11 more) | Used |
| `payload` | api/database/migrations/0001_01_01_000000_create_users_table.php:37, api/database/migrations/0001_01_01_000002_create_jobs_table.php:19, api/database/migrations/0001_01_01_000002_create_jobs_table.php:44 (+2 more) | Used |
| `exception` | api/app/Console/Commands/PopulateAnnotationLinks.php:42, api/app/Console/Commands/PopulateAnnotationLinks.php:47, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:48 (+5 more) | Used |
| `failed_at` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:46 | Used |

---
## Table: `gwamh`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |

---
## Table: `gwamhitems`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `GamhID` | N/A | **Possibly Unused** |
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `hadithcontroverialdescrp`
**Used in (3 places):**
- api/app/Http/Controllers/Api/V1/GetControversialController.php:41
- api/app/Http/Controllers/Api/V1/GetControversialController.php:42
- api/app/Models/ControversialDescription.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |

---
## Table: `hadithcontroversialtree`
**Used in (5 places):**
- api/app/Models/ControversialNode.php:18
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:18
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:34
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:73
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:100

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `IsColored` | api/app/Models/ControversialNode.php:51, api/app/Models/ExpressionNode.php:54, api/app/Models/Subject.php:51 (+2 more) | Used |

---
## Table: `hadithexpressionshits`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `HitID` | N/A | **Possibly Unused** |

---
## Table: `hadithexpressionssays`
**Used in (6 places):**
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:40
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:42
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:44
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50
- ... and 1 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `ScientistID` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:40, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:36, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:51 (+9 more) | Used |
| `Say` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:44, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:68, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:54 (+23 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |
| `LinkID` | api/app/Console/Commands/MigrateAnnotations.php:178, api/app/Console/Commands/MigrateAnnotations.php:195, api/app/Console/Commands/MigrateAnnotations.php:202 (+16 more) | Used |

---
## Table: `hadithexpressionstree`
**Used in (5 places):**
- api/app/Models/ExpressionNode.php:18
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:19
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:39
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:79
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:101

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `IsMatn` | api/app/Models/ExpressionNode.php:51 | Used |
| `IsSand` | api/app/Models/ExpressionNode.php:52 | Used |
| `IsRawy` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:57, api/app/Http/Controllers/Api/V1/GetNarratorsByBookController.php:41, api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:38 (+4 more) | Used |
| `IsColored` | api/app/Models/ControversialNode.php:51, api/app/Models/ExpressionNode.php:54, api/app/Models/Subject.php:51 (+2 more) | Used |

---
## Table: `hadithghareeb`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |

---
## Table: `hadithjudgmenthits`
**Used in (5 places):**
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:39
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:55
- api/app/Models/HadithJudgmentHit.php:22

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `SayID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53 (+7 more) | Used |
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |

---
## Table: `hadithjudgmentlinks`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `SayID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53 (+7 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |
| `ISBookTocHadith` | N/A | **Possibly Unused** |

---
## Table: `hadithjudgmentsays`
**Used in (3 places):**
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53
- api/app/Models/JudgmentSay.php:25

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `ScientistID` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:40, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:36, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:51 (+9 more) | Used |
| `Say` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:44, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:68, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:54 (+23 more) | Used |
| `LinkID` | api/app/Console/Commands/MigrateAnnotations.php:178, api/app/Console/Commands/MigrateAnnotations.php:195, api/app/Console/Commands/MigrateAnnotations.php:202 (+16 more) | Used |

---
## Table: `hadithjudgmentscientists`
**Used in (3 places):**
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:38
- api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:54
- api/app/Models/JudgmentScientist.php:21

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |

---
## Table: `hadithmodrag`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |

---
## Table: `hadithservicesstate`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `Takhreg` | N/A | **Possibly Unused** |
| `CompoundMatn` | api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:11, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:18, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:28 (+9 more) | Used |
| `Rwah` | spa/src/features/statistics/StatisticsHub.tsx:22 | Used |
| `Asnad` | N/A | **Possibly Unused** |
| `Shawahed` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:124, api/tests/Feature/SunnahFeaturesTest.php:42, api/tests/Feature/SunnahFeaturesTest.php:57 (+7 more) | Used |
| `Ghareeb` | spa/dist/assets/index-DyjNWy-k.js:15, spa/dist/assets/index-DyjNWy-k.js:18, spa/src/features/thematic/ThematicHub.tsx:11 (+7 more) | Used |
| `Degree` | N/A | **Possibly Unused** |
| `Sharh` | N/A | **Possibly Unused** |
| `Subjects` | api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:62, api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:64, api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:70 (+4 more) | Used |
| `Tafsser` | N/A | **Possibly Unused** |
| `Biography` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:90, api/app/Models/BiographyScientist.php:52, api/app/Models/Narrator.php:155 (+1 more) | Used |
| `Medicine` | N/A | **Possibly Unused** |
| `Feqh` | N/A | **Possibly Unused** |
| `Asbab` | N/A | **Possibly Unused** |
| `Mokhtalaf` | N/A | **Possibly Unused** |
| `Amthal` | api/app/Models/Proverb.php:16, api/routes/api.php:98, spa/dist/assets/index-DyjNWy-k.js:9 (+8 more) | Used |
| `Kerat` | N/A | **Possibly Unused** |
| `ProperName` | N/A | **Possibly Unused** |
| `Countries` | N/A | **Possibly Unused** |
| `MatnComparison` | api/app/Models/MatnComparison.php:11, api/app/Models/MatnComparison.php:66 | Used |
| `Modrag` | N/A | **Possibly Unused** |
| `Motawater` | N/A | **Possibly Unused** |

---
## Table: `hadithshawahed`
**Used in (3 places):**
- api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:96
- api/app/Models/HadithShawahed.php:10
- api/app/Models/HadithShawahed.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |

---
## Table: `hadithsservices`
**Used in (2 places):**
- api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:38
- api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:71

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |
| `TypeID` | api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:30, api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:39, api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:61 (+5 more) | Used |
| `Reserve` | N/A | **Possibly Unused** |

---
## Table: `hadithsservicestypes`
**Used in (3 places):**
- api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:39
- api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:62
- api/app/Http/Controllers/Api/V1/GetScSayScienceController.php:72

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |

---
## Table: `hcompoundmatn`
**Used in (15 places):**
- api/app/Console/Commands/MigrateAnnotations.php:30
- api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:88
- api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:90
- api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:91
- api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:92
- ... and 10 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `CleanMatn` | api/app/Console/Commands/MigrateAnnotations.php:45, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:92, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:100 (+10 more) | Used |
| `MatnAnnotations` | api/app/Console/Commands/MigrateAnnotations.php:46, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:93, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:131 (+9 more) | Used |
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `AsanedComp` | api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:94, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:132, api/app/Http/Resources/CompoundMatnResource.php:28 (+2 more) | Used |

---
## Table: `hgamhalmatn`
**Used in (2 places):**
- api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:65
- api/app/Models/MatnGroup.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `GroupID` | api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:52, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:66, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:80 (+3 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |

---
## Table: `hmatncomparison1`
**Used in (1 places):**
- api/app/Models/MatnComparison.php:18

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison10`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison11`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison12`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison13`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison14`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison15`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison16`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison17`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison18`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison19`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison2`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison20`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison21`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison22`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison23`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison24`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison25`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison26`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison27`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison28`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison29`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison3`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison30`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison31`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison32`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison33`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison4`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison5`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison6`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison7`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison8`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `hmatncomparison9`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MasterMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:60, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:101, api/app/Models/MatnComparison.php:47 (+1 more) | Used |
| `SlaveMatnID` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:61, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:102, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:104 (+5 more) | Used |
| `Comment` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:105, api/routes/console.php:9, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |
| `MatchSort` | api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:106, api/app/Models/MatnComparison.php:49, spa/dist/assets/index-DyjNWy-k.js:9 (+2 more) | Used |

---
## Table: `htakhreeg`
**Used in (4 places):**
- api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:82
- api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:84
- api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:85
- api/app/Models/HadithTakhreej.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `HadithMainID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:57, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:43, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:45 (+69 more) | Used |
| `GroupID` | api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:52, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:66, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:80 (+3 more) | Used |
| `CompoundMatnID` | api/app/Models/HadithTakhreej.php:56 | Used |
| `PivotRawy` | N/A | **Possibly Unused** |
| `PivotID` | api/app/Models/HadithTakhreej.php:57 | Used |
| `SandRawy` | N/A | **Possibly Unused** |
| `MatnLength` | api/app/Models/HadithTakhreej.php:58 | Used |
| `IsStory` | api/app/Models/HadithTakhreej.php:59 | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |

---
## Table: `index`
**Used in (87 places):**
- api/app/Console/Commands/PopulateAnnotationLinks.php:41
- api/app/Console/Commands/PopulateAnnotationLinks.php:43
- api/app/Console/Commands/PopulateAnnotationLinks.php:46
- api/app/Console/Commands/PopulateAnnotationLinks.php:48
- api/app/Console/Commands/PopulateAnnotationLinks.php:60
- ... and 82 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Title` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:67, api/app/Http/Controllers/Api/V1/GetControversialController.php:49, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:74 (+144 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `Tag` | api/app/Console/Commands/MigrateAnnotations.php:156, api/app/Console/Commands/MigrateAnnotations.php:186, api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:59 (+22 more) | Used |
| `Attribute` | api/config/sanctum.php:51, api/config/session.php:213 | Used |
| `Value` | api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:55, api/app/Http/Controllers/Api/V1/GetMosannafatStatsController.php:56, api/config/app.php:12 (+118 more) | Used |

---
## Table: `indexitem`
**Used in (10 places):**
- api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:11
- api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:19
- api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:30
- api/app/Http/Controllers/Api/V1/GetIndexPoetryController.php:10
- api/app/Http/Controllers/Api/V1/GetIndexPoetryController.php:16
- ... and 5 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Title` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:67, api/app/Http/Controllers/Api/V1/GetControversialController.php:49, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:74 (+144 more) | Used |
| `IndexID` | api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:58, api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:116, api/app/Http/Controllers/Api/V1/GetIndexNamesController.php:140 (+6 more) | Used |

---
## Table: `jobs`
**Used in (6 places):**
- api/config/queue.php:42
- api/config/queue.php:97
- api/config/queue.php:101
- api/config/queue.php:102
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:16
- ... and 1 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `queue` | api/config/queue.php:9, api/config/queue.php:12, api/config/queue.php:14 (+11 more) | Used |
| `payload` | api/database/migrations/0001_01_01_000000_create_users_table.php:37, api/database/migrations/0001_01_01_000002_create_jobs_table.php:19, api/database/migrations/0001_01_01_000002_create_jobs_table.php:44 (+2 more) | Used |
| `attempts` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:20 | Used |
| `reserved_at` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:21 | Used |
| `available_at` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:22 | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |

---
## Table: `job_batches`
**Used in (3 places):**
- api/config/queue.php:92
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:26
- api/database/migrations/0001_01_01_000002_create_jobs_table.php:56

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `total_jobs` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:29 | Used |
| `pending_jobs` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:30 | Used |
| `failed_jobs` | api/config/queue.php:111, api/database/migrations/0001_01_01_000002_create_jobs_table.php:31, api/database/migrations/0001_01_01_000002_create_jobs_table.php:39 (+1 more) | Used |
| `failed_job_ids` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:32 | Used |
| `options` | api/config/app.php:115, api/config/auth.php:83, api/config/cache.php:64 (+14 more) | Used |
| `cancelled_at` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:34 | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |
| `finished_at` | api/database/migrations/0001_01_01_000002_create_jobs_table.php:36 | Used |

---
## Table: `lexicon`
**Used in (20 places):**
- api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:37
- api/app/Http/Controllers/Api/V1/GetLexiconWordController.php:41
- api/app/Models/LexiconDescription.php:56
- api/app/Models/LexiconItem.php:57
- api/app/Models/LexiconItem.php:67
- ... and 15 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |

---
## Table: `lexicondescrp`
**Used in (5 places):**
- api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:41
- api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:42
- api/app/Http/Controllers/Api/V1/GetLexiconPlacesController.php:41
- api/app/Http/Controllers/Api/V1/GetLexiconPlacesController.php:42
- api/app/Models/LexiconDescription.php:22

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `LexiconID` | api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:64, api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:65, api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:79 (+5 more) | Used |
| `LexiconItemID` | api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:42, api/app/Http/Controllers/Api/V1/GetLexiconPlacesController.php:42, api/app/Http/Controllers/Api/V1/GetLexiconWordController.php:36 (+5 more) | Used |
| `DescrpMainID` | api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:41, api/app/Http/Controllers/Api/V1/GetLexiconPlacesController.php:41, api/app/Http/Controllers/Api/V1/GetLexiconWordController.php:53 (+4 more) | Used |

---
## Table: `lexiconitems`
**Used in (7 places):**
- api/app/Models/LexiconItem.php:19
- api/config/tag-types.php:10
- api/config/tag-types.php:35
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:17
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:29
- ... and 2 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `LexiconID` | api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:64, api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:65, api/app/Http/Controllers/Api/V1/GetLexiconGhareebController.php:79 (+5 more) | Used |
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `LinkID` | api/app/Console/Commands/MigrateAnnotations.php:178, api/app/Console/Commands/MigrateAnnotations.php:195, api/app/Console/Commands/MigrateAnnotations.php:202 (+16 more) | Used |
| `ResultsCount` | api/app/Models/LexiconItem.php:53, spa/src/types/index.ts:219 | Used |

---
## Table: `matndates`
**Used in (2 places):**
- api/app/Models/MatnDate.php:16
- api/config/tag-types.php:21

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |

---
## Table: `migrations`
**Used in (41 places):**
- api/app/Console/Commands/MigrateAnnotations.php:63
- api/config/database.php:124
- api/config/database.php:126
- api/config/database.php:130
- api/config/database.php:131
- ... and 36 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `migration` | api/config/database.php:121, api/database/migrations/0001_01_01_000000_create_users_table.php:5, api/database/migrations/0001_01_01_000000_create_users_table.php:9 (+22 more) | Used |
| `batch` | api/app/Console/Commands/MigrateAnnotations.php:22, api/app/Console/Commands/MigrateAnnotations.php:119, api/app/Console/Commands/PopulateAnnotationLinks.php:17 | Used |

---
## Table: `nouns`
**Used in (17 places):**
- api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:40
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:134
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:135
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:141
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:142
- ... and 12 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `AbbName` | api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:69, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:81, api/app/Http/Controllers/Api/V1/ListNarratorsController.php:69 (+10 more) | Used |
| `EsmShuhra` | api/app/Http/Controllers/Api/V1/ListNarratorsController.php:40, api/app/Http/Resources/NarratorDetailResource.php:39, api/app/Models/Narrator.php:27 (+5 more) | Used |
| `Kunia` | api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:70, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:82, api/app/Http/Controllers/Api/V1/ListNarratorsController.php:40 (+11 more) | Used |
| `Laqab` | api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:71, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:83, api/app/Http/Controllers/Api/V1/ListNarratorsController.php:40 (+11 more) | Used |
| `Nasab` | api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:72, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:84, api/app/Http/Controllers/Api/V1/ListNarratorsController.php:40 (+8 more) | Used |
| `Tabaqa` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:30, api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:31, api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:32 (+33 more) | Used |
| `TabaqaNum` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:33, api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:34, api/app/Http/Resources/NarratorDetailResource.php:31 (+3 more) | Used |
| `BirthYear` | api/app/Http/Resources/NarratorDetailResource.php:32, api/app/Models/Narrator.php:20, spa/dist/assets/index-DyjNWy-k.js:12 (+2 more) | Used |
| `DeathYear` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:64, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:74, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:86 (+16 more) | Used |
| `DeathYearNum` | api/app/Http/Resources/NarratorDetailResource.php:34, api/app/Models/Narrator.php:22, api/app/Models/Narrator.php:69 (+1 more) | Used |
| `BirthCity` | N/A | **Possibly Unused** |
| `DeathCity` | api/app/Http/Resources/NarratorDetailResource.php:38, api/app/Models/Narrator.php:26, spa/dist/assets/index-DyjNWy-k.js:12 (+2 more) | Used |
| `LivingCity` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:40, api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:41, api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:42 (+11 more) | Used |
| `SelatKaraba` | N/A | **Possibly Unused** |
| `Mazhb` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:53 | Used |
| `JourneyCity` | N/A | **Possibly Unused** |
| `JourneyDate` | N/A | **Possibly Unused** |
| `MartabaIbnHajar` | api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:35, api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:36, api/app/Http/Controllers/Api/V1/GetTransmissionChainController.php:75 (+14 more) | Used |
| `MartabaZahabi` | api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:35, api/app/Http/Resources/NarratorDetailResource.php:36, api/app/Models/Narrator.php:24 (+3 more) | Used |
| `HadithsCount` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:135, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:136, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:142 (+30 more) | Used |
| `UserComments` | N/A | **Possibly Unused** |
| `IsRawy` | api/app/Http/Controllers/Api/V1/GetNarratorClassificationsController.php:57, api/app/Http/Controllers/Api/V1/GetNarratorsByBookController.php:41, api/app/Http/Controllers/Api/V1/GetStatsRwahController.php:38 (+4 more) | Used |
| `IsScientist` | api/app/Models/Narrator.php:72 | Used |
| `IsNoun` | api/app/Models/Narrator.php:73 | Used |
| `IsForWork` | api/app/Models/Narrator.php:74 | Used |
| `IsMobham` | api/app/Models/Narrator.php:75 | Used |
| `IsHasRwaya` | api/app/Models/Narrator.php:76 | Used |
| `NounsBooks` | api/app/Http/Controllers/Api/V1/GetNarratorsByBookController.php:43, api/app/Http/Controllers/Api/V1/GetStatsRwahBooksController.php:39, api/app/Http/Controllers/Api/V1/GetStatsRwahBooksController.php:40 (+1 more) | Used |

---
## Table: `nounsbooks`
**Used in (4 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorsByBookController.php:43
- api/app/Http/Controllers/Api/V1/GetStatsRwahBooksController.php:39
- api/app/Http/Controllers/Api/V1/GetStatsRwahBooksController.php:40
- api/app/Models/Narrator.php:118

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |

---
## Table: `nounsforms`
**Used in (2 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:81
- api/app/Models/NarratorNameForm.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `RawyText` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:83, spa/dist/assets/index-DyjNWy-k.js:12, spa/src/features/narrators/NarratorDrawer.tsx:484 | Used |
| `RawyTextShape` | N/A | **Possibly Unused** |
| `Frequency` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:83, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:84, api/app/Models/NarratorNameForm.php:48 (+2 more) | Used |
| `RawyTextID` | api/app/Models/NarratorNameForm.php:49 | Used |

---
## Table: `nounsgarh`
**Used in (1 places):**
- api/app/Models/CritiqueTerm.php:24

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `Sort` | api/app/Console/Commands/MigrateAnnotations.php:263, api/app/Http/Controllers/Api/V1/GetCritiqueTermsController.php:41, api/app/Models/CritiqueTerm.php:13 (+7 more) | Used |
| `IsTaqreeb` | api/app/Models/CritiqueTerm.php:14, api/app/Models/CritiqueTerm.php:55 | Used |

---
## Table: `nounsgarhlinks`
**Used in (1 places):**
- api/app/Models/CritiqueTermLink.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `GarhID` | api/app/Models/CritiqueTerm.php:65, api/app/Models/CritiqueTermLink.php:47, api/app/Models/CritiqueTermLink.php:68 | Used |
| `SayID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53 (+7 more) | Used |

---
## Table: `nounsrelations`
**Used in (5 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:64
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:66
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:70
- api/app/Models/NarratorRelation.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `FirstRawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:65, api/app/Models/Narrator.php:151, api/app/Models/NarratorRelation.php:54 (+1 more) | Used |
| `SecondRawyID` | api/app/Models/NarratorRelation.php:55, api/app/Models/NarratorRelation.php:78 | Used |
| `SayID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53 (+7 more) | Used |
| `RelationType` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:66, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:70, api/app/Models/NarratorRelation.php:57 (+3 more) | Used |
| `IsShiekh` | api/app/Models/NarratorRelation.php:58 | Used |
| `Reserve` | N/A | **Possibly Unused** |

---
## Table: `nounsrelationstypes`
**Used in (7 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:66
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:71
- api/app/Models/NarratorRelationType.php:17
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:21
- api/database/migrations/2026_06_26_180000_migrate_lexicons_and_others_to_adjacency_list.php:49
- ... and 2 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |

---
## Table: `nounsscientists`
**Used in (5 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:50
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:53
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:68
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:72
- api/app/Models/BiographyScientist.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `ScientistID` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:40, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:36, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:51 (+9 more) | Used |
| `RelaterID` | api/app/Models/BiographyScientist.php:48 | Used |
| `ScientistName` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:53, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:72, api/app/Http/Resources/HadithJudgmentResource.php:25 (+6 more) | Used |
| `RelaterName` | N/A | **Possibly Unused** |

---
## Table: `nounsscientistssays`
**Used in (10 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:48
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:50
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:52
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:54
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:55
- ... and 5 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `NScientistID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:50, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:68, api/app/Http/Controllers/Api/V1/GetScholarOpinionsController.php:53 (+4 more) | Used |
| `Say` | api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:44, api/app/Http/Controllers/Api/V1/GetHadithDetailController.php:68, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:54 (+23 more) | Used |
| `SaySort` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:55, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:57, api/app/Http/Resources/ScholarOpinionResource.php:27 (+6 more) | Used |

---
## Table: `nounsscientistssayslinks`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `SayID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:67, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:37, api/app/Http/Controllers/Api/V1/GetScSayHadithController.php:53 (+7 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |
| `LinkID` | api/app/Console/Commands/MigrateAnnotations.php:178, api/app/Console/Commands/MigrateAnnotations.php:195, api/app/Console/Commands/MigrateAnnotations.php:202 (+16 more) | Used |
| `ISBookTocHadith` | N/A | **Possibly Unused** |

---
## Table: `nounsshyoukhtalamize`
**Used in (10 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:132
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:134
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:135
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:136
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:139
- ... and 5 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `RawyID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:49, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:82, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:133 (+23 more) | Used |
| `ShyoukhID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:134, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:140, api/app/Models/Narrator.php:90 (+1 more) | Used |
| `HadithsCount` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:135, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:136, api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:142 (+30 more) | Used |

---
## Table: `nounsstat1`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Title` | api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:67, api/app/Http/Controllers/Api/V1/GetControversialController.php:49, api/app/Http/Controllers/Api/V1/GetGroupedMtnController.php:74 (+144 more) | Used |
| `Count` | api/app/Console/Commands/MigrateAnnotations.php:67, api/app/Console/Commands/MigrateAnnotations.php:72, api/app/Console/Commands/MigrateAnnotations.php:120 (+29 more) | Used |

---
## Table: `nounstranslation`
**Used in (4 places):**
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:91
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:93
- api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:94
- api/app/Models/NarratorTranslation.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `NounID` | api/app/Http/Controllers/Api/V1/GetNarratorDetailController.php:92, api/app/Models/Narrator.php:161, api/app/Models/NarratorTranslation.php:46 (+1 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |

---
## Table: `pages`
**Used in (4 places):**
- spa/src/features/search/Pagination.tsx:21
- spa/src/features/search/Pagination.tsx:22
- spa/src/features/search/Pagination.tsx:27
- spa/src/features/search/Pagination.tsx:66

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `MainID` | api/test_mainid.php:8, api/app/Console/Commands/MigrateAnnotations.php:21, api/app/Console/Commands/PopulateAnnotationLinks.php:53 (+168 more) | Used |
| `PartNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:49, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:78, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:64 (+72 more) | Used |
| `PageNum` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:50, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:79, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:65 (+72 more) | Used |
| `PageID` | N/A | **Possibly Unused** |
| `NextPageID` | N/A | **Possibly Unused** |
| `PrevPageID` | N/A | **Possibly Unused** |

---
## Table: `password_reset_tokens`
**Used in (3 places):**
- api/config/auth.php:100
- api/database/migrations/0001_01_01_000000_create_users_table.php:26
- api/database/migrations/0001_01_01_000000_create_users_table.php:48

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `email` | api/app/Http/Controllers/Api/V1/GetUserController.php:30, api/app/Http/Controllers/Api/V1/LoginController.php:33, api/app/Http/Controllers/Api/V1/LoginController.php:39 (+29 more) | Used |
| `token` | api/app/Http/Controllers/Api/V1/LoginController.php:46, api/app/Http/Controllers/Api/V1/LoginController.php:54, api/app/Http/Controllers/Api/V1/LogoutController.php:24 (+24 more) | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |

---
## Table: `personal_access_tokens`
**Used in (2 places):**
- api/database/migrations/2026_06_21_034358_create_personal_access_tokens_table.php:16
- api/database/migrations/2026_06_21_034358_create_personal_access_tokens_table.php:33

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `tokenable_type` | N/A | **Possibly Unused** |
| `tokenable_id` | N/A | **Possibly Unused** |
| `name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `token` | api/app/Http/Controllers/Api/V1/LoginController.php:46, api/app/Http/Controllers/Api/V1/LoginController.php:54, api/app/Http/Controllers/Api/V1/LogoutController.php:24 (+24 more) | Used |
| `abilities` | api/database/migrations/2026_06_21_034358_create_personal_access_tokens_table.php:21 | Used |
| `last_used_at` | api/database/migrations/2026_06_21_034358_create_personal_access_tokens_table.php:22 | Used |
| `expires_at` | api/config/sanctum.php:51, api/database/migrations/2026_06_21_034358_create_personal_access_tokens_table.php:23 | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |
| `updated_at` | N/A | **Possibly Unused** |

---
## Table: `quranayat`
**Used in (9 places):**
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:86
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:87
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:89
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:90
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:91
- ... and 4 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `SoraID` | api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:73, api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:86, api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:90 (+8 more) | Used |
| `AyaNum` | api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:74, api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:91, api/app/Models/QuranVerse.php:49 (+9 more) | Used |
| `Text` | api/app/Contracts/ArabicNormalizerInterface.php:10, api/app/Contracts/ArabicNormalizerInterface.php:12, api/app/Http/Controllers/Api/V1/GetAmthalController.php:35 (+950 more) | Used |
| `HasTafsser` | api/app/Models/QuranSurah.php:47, api/app/Models/QuranVerse.php:50, spa/src/types/index.ts:271 | Used |
| `HasQera` | api/app/Models/QuranSurah.php:48, api/app/Models/QuranVerse.php:51, spa/src/types/index.ts:272 | Used |
| `KeratText` | N/A | **Possibly Unused** |

---
## Table: `quranayatdescrp`
**Used in (4 places):**
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:47
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:48
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:49
- api/app/Models/QuranVerseDescription.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |
| `Sura` | api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:48, api/app/Models/QuranVerseDescription.php:48 | Used |
| `Aya` | api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:49, api/app/Models/QuranVerseDescription.php:49 | Used |

---
## Table: `quranayatkerat`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `AyaID` | N/A | **Possibly Unused** |
| `ServiceMainID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:41, api/app/Http/Controllers/Api/V1/GetDefinitionsController.php:50 (+14 more) | Used |

---
## Table: `quranreaders`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `ReaderName` | N/A | **Possibly Unused** |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `LeftValue` | api/app/Http/Resources/TocNodeResource.php:29, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |
| `RightValue` | api/app/Http/Resources/TocNodeResource.php:30, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `IsColored` | api/app/Models/ControversialNode.php:51, api/app/Models/ExpressionNode.php:54, api/app/Models/Subject.php:51 (+2 more) | Used |

---
## Table: `quranreadersayat`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ReaderID` | N/A | **Possibly Unused** |
| `AyaID` | N/A | **Possibly Unused** |

---
## Table: `quransoar`
**Used in (2 places):**
- api/app/Http/Controllers/Api/V1/GetIndexVersesController.php:86
- api/app/Models/QuranSurah.php:17

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `HasTafsser` | api/app/Models/QuranSurah.php:47, api/app/Models/QuranVerse.php:50, spa/src/types/index.ts:271 | Used |
| `HasQera` | api/app/Models/QuranSurah.php:48, api/app/Models/QuranVerse.php:51, spa/src/types/index.ts:272 | Used |

---
## Table: `sectionbooks`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `BookID` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:54, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:62, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:63 (+112 more) | Used |
| `SectionID` | N/A | **Possibly Unused** |

---
## Table: `sections`
**Status: Possibly Unused (Table name not found in code)**

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `Name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `LeftValue` | api/app/Http/Resources/TocNodeResource.php:29, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |
| `RightValue` | api/app/Http/Resources/TocNodeResource.php:30, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:21, api/database/migrations/2026_06_25_174533_migrate_nested_set_to_adjacency_list.php:26 (+24 more) | Used |

---
## Table: `sessions`
**Used in (8 places):**
- api/config/sanctum.php:51
- api/config/session.php:65
- api/config/session.php:73
- api/config/session.php:86
- api/config/session.php:91
- ... and 3 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `user_id` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:36, api/app/Http/Controllers/Api/V1/ToggleBookmarkController.php:55, api/app/Http/Controllers/Api/V1/ToggleBookmarkController.php:65 (+4 more) | Used |
| `ip_address` | api/database/migrations/0001_01_01_000000_create_users_table.php:35 | Used |
| `user_agent` | api/database/migrations/0001_01_01_000000_create_users_table.php:36 | Used |
| `payload` | api/database/migrations/0001_01_01_000000_create_users_table.php:37, api/database/migrations/0001_01_01_000002_create_jobs_table.php:19, api/database/migrations/0001_01_01_000002_create_jobs_table.php:44 (+2 more) | Used |
| `last_activity` | api/database/migrations/0001_01_01_000000_create_users_table.php:38 | Used |

---
## Table: `subject`
**Used in (30 places):**
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:8
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:15
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:22
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:37
- api/app/Models/Subject.php:11
- ... and 25 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `SubjectTitle` | api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:65, spa/dist/assets/index-DyjNWy-k.js:18, spa/src/features/thematic/ThematicHub.tsx:460 (+3 more) | Used |
| `ParentID` | api/app/Http/Controllers/Api/V1/GetBookTocController.php:39, api/app/Http/Controllers/Api/V1/GetControversialController.php:34, api/app/Http/Controllers/Api/V1/GetControversialController.php:74 (+114 more) | Used |
| `IsLeaf` | api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:53, api/app/Http/Controllers/Api/V1/GetAtrafExtraController.php:64, api/app/Http/Controllers/Api/V1/GetAtrafListController.php:42 (+61 more) | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |
| `IsColored` | api/app/Models/ControversialNode.php:51, api/app/Models/ExpressionNode.php:54, api/app/Models/Subject.php:51 (+2 more) | Used |

---
## Table: `subjecthit`
**Used in (9 places):**
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:9
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:17
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:22
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:41
- api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:42
- ... and 4 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `ID` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `SubjectID` | api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:33, api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:38, api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:39 (+6 more) | Used |
| `ParagraphMainID` | api/app/Http/Controllers/Api/V1/GetSubjectTreeController.php:41, api/app/Models/SubjectHit.php:48, api/app/Models/SubjectHit.php:69 | Used |
| `NodeID` | api/app/Http/Controllers/Api/V1/GetControversialController.php:33, api/app/Http/Controllers/Api/V1/GetControversialController.php:38, api/app/Http/Controllers/Api/V1/GetControversialController.php:39 (+23 more) | Used |

---
## Table: `users`
**Used in (19 places):**
- api/app/Http/Controllers/Api/V1/RegisterController.php:34
- api/config/auth.php:22
- api/config/auth.php:35
- api/config/auth.php:45
- api/config/auth.php:55
- ... and 14 more

### Fields
| Field | Type/Usage | Status |
|---|---|---|
| `id` | api/app/Console/Commands/PopulateAnnotationLinks.php:76, api/app/Console/Commands/PopulateAnnotationLinks.php:115, api/app/Http/Controllers/Api/V1/GetAtrafAsanedController.php:48 (+572 more) | Used |
| `name` | api/app/Console/Commands/MigrateAnnotations.php:14, api/app/Console/Commands/MigrateAnnotations.php:19, api/app/Console/Commands/MigrateAnnotations.php:43 (+141 more) | Used |
| `email` | api/app/Http/Controllers/Api/V1/GetUserController.php:30, api/app/Http/Controllers/Api/V1/LoginController.php:33, api/app/Http/Controllers/Api/V1/LoginController.php:39 (+29 more) | Used |
| `email_verified_at` | api/app/Models/User.php:59, api/database/factories/UserFactory.php:32, api/database/factories/UserFactory.php:44 (+1 more) | Used |
| `password` | api/app/Http/Controllers/Api/V1/LoginController.php:34, api/app/Http/Controllers/Api/V1/LoginController.php:42, api/app/Http/Controllers/Api/V1/RegisterController.php:35 (+36 more) | Used |
| `remember_token` | api/app/Models/User.php:38, api/database/factories/UserFactory.php:34 | Used |
| `created_at` | api/app/Http/Controllers/Api/V1/GetBookmarksController.php:38, api/database/migrations/0001_01_01_000000_create_users_table.php:29, api/database/migrations/0001_01_01_000002_create_jobs_table.php:23 (+1 more) | Used |
| `updated_at` | N/A | **Possibly Unused** |

---
