# Database and Relations Documentation

This document provides a comprehensive overview of the **Prophetic Sunnah Encyclopedia** (جامع السنة النبوية) database schema, tables, and relationships. It details the transition from the proprietary database engine format (originally used by the desktop client) to standard MySQL/MariaDB.

---

## 1. Database Overview

The original database was designed as a proprietary desktop indexing database (using folders for tables, and binary index files for relationships) totaling **4.88 GB** across 3,433 files. 

For modern applications and web interfaces, this database has been converted to MySQL/MariaDB:
* **Database Name**: `hadithdb`
* **Table Count**: 98 Tables
* **Relationship Mappings**: 69 Defined Binary Relations (converted to relational keys)
* **Total Schema Size on Disk**: ~2.3 GB of optimized SQL dumps (before indexing)
* **Import Verification**: 98/98 tables successfully loaded with 0 empty tables, 0 corrupted tables, and fully validated Arabic UTF-8 text encoding.

### Critical Import Fixes
1. **`AsanedTree`**: The table was missing in initial imports. Manually re-imported from `AsanedTree.sql` to load **797,473 rows**.
2. **`AsanedHadiths`**: The source SQL schema mistakenly declared `PRIMARY KEY (HadithMainID)`. Since single Hadiths can have multiple narrator chains, the table contains duplicate Hadith IDs. This caused insertion failures that rolled back the table to 0 rows. The constraint was resolved by removing `PRIMARY KEY` and adding non-unique indexes `KEY (HadithMainID), KEY (SanadID)`. Re-imported successfully with **341,289 rows**.

---

## 2. Core Entities & Concepts

The database is structured around six core modules of Islamic and Hadith sciences:

1. **Hadith Texts (`BookTOC_Hadith`, `HCompoundMatn`, `HGamhAlMatn`)**
   Contains the main text of the Hadiths, section and chapter titles (TOC), and variations of the Hadith text across different narrations.
2. **Hadith Narrators & Biographies (`Nouns`, `NounsTranslation`, `NounsShyoukhTalamize`)**
   Narrators are stored in the `Nouns` table. Detailed biographical information, teacher-student links, and translations are available to establish chains of narration (Asaneed).
3. **Scholarly Evaluations (`NounsScientistsSays`, `HadithJudgmentSays`, `NounsGarh`)**
   Stores evaluations of narrator credibility (Jarh wa Ta'dil) by classical scholars (`NounsScientists`) and judgements on Hadith authenticity (`HadithAdjustmentScientists`, e.g., Sahih, Da'if).
4. **Chains of Transmission (`Asaned`, `AsanedTree`, `AsanedHadiths`)**
   Encodes the transmission graphs (chains of narrators) linking Hadiths to the Prophet Muhammad (PBUH) or companions.
5. **Quranic References (`QuranAyat`, `QuranAyatDescrp`, `QuranReaders`)**
   Integrates Quranic verses, Tafsir (explanations), recitations, and reader information linked to the Hadiths.
6. **Lexicons and Subjects (`LexiconItems`, `Subject`, `SubjectHit`)**
   Subject indexing mapping Hadiths to thematic areas (e.g., belief, prayer, ethics) and dictionary terms for unfamiliar words (`Lexicon`).

---

## 3. Relationships Mapping

In the proprietary engine, foreign-key relationships were cached in binary files under the `Relations/` directory to accelerate joins. In MySQL, these correspond to standard primary-foreign key relationships.

The 69 relationships are documented below:

| # | Relationship Name | Primary Key (PK) | Foreign Key (FK) | Original Binary File | Description |
|---|-------------------|------------------|------------------|----------------------|-------------|
| 1 | `Asaned.ID=AsanedHadiths.SanadID` | `Asaned.ID` | `AsanedHadiths.SanadID` | `AsanedAsanedHadiths.bin` | Links chain identifiers to Hadith associations |
| 2 | `AsanedTahdeth.ID=AsanedHadiths.SanadTahdethID` | `AsanedTahdeth.ID` | `AsanedHadiths.SanadTahdethID` | `AsanedTahdethAsanedHadiths.bin` | Links chains to specific narrator transmission verbs (e.g., "narrated to us") |
| 3 | `Book.ID=BookBookTOC_Hadith.BookID` | `Book.ID` | `BookTOC_Hadith.BookID` | `BookBookTOC_Hadith.bin` | Maps books to their respective table of contents (TOC) paragraphs |
| 4 | `Book.ID=BookBookTOC_Services.BookID` | `Book.ID` | `BookTOC_Services.BookID` | `BookBookTOC_Services.bin` | Maps books to auxiliary services TOC |
| 5 | `Book.ID=BookNounsBooks.BookID` | `Book.ID` | `NounsBooks.BookID` | `BookNounsBooks.bin` | Associates narrator books with narrator entries |
| 6 | `BookTOC_Hadith.MainID=HCompoundMatn.HadithMainID` | `BookTOC_Hadith.MainID` | `HCompoundMatn.HadithMainID` | `BookTOC_HadithHCompoundMatn.bin` | Maps a main Hadith to its textual components/variations |
| 7 | `BookTOC_Hadith.MainID=HGamhAlMatn.HadithMainID` | `BookTOC_Hadith.MainID` | `HGamhAlMatn.HadithMainID` | `BookTOC_HadithHGamhAlMatn.bin` | Links Hadith entries to the combined texts collection |
| 8 | `BookTOC_Hadith.MainID=HTakhreeg.HadithMainID` | `BookTOC_Hadith.MainID` | `HTakhreeg.HadithMainID` | `BookTOC_HadithHTakhreeg.bin` | Links Hadiths to their Takhreej (cross-references/derivations) |
| 9 | `BookTOC_Hadith.MainID=HadithGhareeb.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithGhareeb.HadithMainID` | `BookTOC_HadithHadithGhareeb.bin` | Maps Hadiths to definitions of their unfamiliar vocabulary (Ghareeb) |
| 10 | `BookTOC_Hadith.MainID=HadithJudgmentHits.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithJudgmentHits.HadithMainID` | `BookTOC_HadithHadithJudgmentHits.bin` | Links Hadiths to scholarly authenticity judgments |
| 11 | `BookTOC_Hadith.MainID=HadithModrag.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithModrag.HadithMainID` | `BookTOC_HadithHadithModrag.bin` | Maps Hadiths to notes on interpolated texts (Modraj) |
| 12 | `BookTOC_Hadith.MainID=HadithServicesState.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithServicesState.HadithMainID` | `BookTOC_HadithHadithServicesState.bin` | Tracks available auxiliary services per Hadith |
| 13 | `BookTOC_Hadith.MainID=HadithShawahed.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithShawahed.HadithMainID` | `BookTOC_HadithHadithShawahed.bin` | Maps Hadiths to supporting narrations (Shawahed) |
| 14 | `BookTOC_Hadith.MainID=HadithsServices.HadithMainID` | `BookTOC_Hadith.MainID` | `HadithsServices.HadithMainID` | `BookTOC_HadithHadithsServices.bin` | Maps Hadiths to specific textual services |
| 15 | `BookTOC_Hadith.MainID=Pages.MainID` | `BookTOC_Hadith.MainID` | `Pages.MainID` | `BookTOC_HadithPages.bin` | Links Hadith paragraphs to print book page/volume details |
| 16 | `BookTOC_Hadith.MainID=SubjectHit.ParagraphMainID` | `BookTOC_Hadith.MainID` | `SubjectHit.ParagraphMainID` | `BookTOC_HadithSubjectHit.bin` | Indexes Hadiths by specific subjects/topics |
| 17-50 | `BookTOC_Hadith.MainID=HMatnComparison1..33.SlaveMatnID` | `BookTOC_Hadith.MainID` | `HMatnComparison1..33.SlaveMatnID` | `BookTOC_HadithHMatnComparison1..33.bin` | Detailed comparison tables linking text variances across multiple chains |
| 51 | `BookTOC_Services.MainID=HadithExpressionsSays.ServiceMainID` | `BookTOC_Services.MainID` | `HadithExpressionsSays.ServiceMainID` | `BookTOC_ServicesHadithExpressionsSays.bin` | Maps services to expressions/sayings |
| 52 | `BookTOC_Services.MainID=HadithsServices.ServiceMainID` | `BookTOC_Services.MainID` | `HadithsServices.ServiceMainID` | `BookTOC_ServicesHadithsServices.bin` | Links auxiliary service entries to general Hadith services |
| 53 | `BookTOC_Services.MainID=LexiconDescrp.DescrpMainID` | `BookTOC_Services.MainID` | `LexiconDescrp.DescrpMainID` | `BookTOC_ServicesLexiconDescrp.bin` | Links service items to dictionary definitions (Lexicon) |
| 54 | `BookTOC_Services.MainID=NounsScientistsSaysLinks.ServiceMainID` | `BookTOC_Services.MainID` | `NounsScientistsSaysLinks.ServiceMainID` | `BookTOC_ServicesNounsScientistsSaysLinks.bin` | Connects scholars' commentary to biographies |
| 55 | `BookTOC_Services.MainID=NounsTranslation.ServiceMainID` | `BookTOC_Services.MainID` | `NounsTranslation.ServiceMainID` | `BookTOC_ServicesNounsTranslation.bin` | Links service TOC to narrator translations/biographies |
| 56 | `BookTOC_Services.MainID=QuranAyatDescrp.ServiceMainID` | `BookTOC_Services.MainID` | `QuranAyatDescrp.ServiceMainID` | `BookTOC_ServicesQuranAyatDescrp.bin` | Maps services to explanations of Quranic verses |
| 57 | `BookTOC_Services.MainID=QuranAyatKerat.ServiceMainID` | `BookTOC_Services.MainID` | `QuranAyatKerat.ServiceMainID` | `BookTOC_ServicesQuranAyatKerat.bin` | Links service TOC to Quranic recitation variations (Qira'at) |
| 58 | `HadithAdjustmentSays.ID=HadithJudgmentHits.SayID` | `HadithAdjustmentSays.ID` | `HadithJudgmentHits.SayID` | `HadithJudgmentSaysHadithJudgmentHits.bin` | Maps individual Hadith evaluations to hits in the database |
| 59 | `HadithAdjustmentScientists.ID=HadithJudgmentSays.ScientistID` | `HadithAdjustmentScientists.ID` | `HadithJudgmentSays.ScientistID` | `HadithJudgmentScientistsHadithJudgmentSays.bin` | Identifies which scholar issued a specific Hadith judgment |
| 60 | `Nouns.ID=BookExtra.RawyID` | `Nouns.ID` | `BookExtra.RawyID` | `NounsBookExtra.bin` | Links narrator biography to extra book metadata |
| 61 | `Nouns.ID=NounsBooks.RawyID` | `Nouns.ID` | `NounsBooks.RawyID` | `NounsNounsBooks.bin` | Maps narrator to books they wrote or are cited in |
| 62 | `Nouns.ID=NounsRelations.SecondRawyID` | `Nouns.ID` | `NounsRelations.SecondRawyID` | `NounsNounsRelations.bin` | Maps narrator relations (link to the second narrator in a pair) |
| 63 | `Nouns.ID=NounsScientistsSays.RawyID` | `Nouns.ID` | `NounsScientistsSays.RawyID` | `NounsNounsScientistsSays.bin` | Maps narrators to opinions written about them by scholars |
| 64 | `Nouns.ID=NounsShyoukhTalamize.RawyID` | `Nouns.ID` | `NounsShyoukhTalamize.RawyID` | `NounsNounsShyoukhTalamize.bin` | Maps a narrator to their list of students/teachers |
| 65 | `Nouns.ID=NounsShyoukhTalamize.ShyoukhID` | `Nouns.ID` | `NounsShyoukhTalamize.ShyoukhID` | `NounsNounsShyoukhTalamize.bin` | Connects student records to their teacher's narrator ID |
| 66 | `NounsScientists.ID=NounsScientistsSays.NScientistID` | `NounsScientists.ID` | `NounsScientistsSays.NScientistID` | `NounsScientistsNounsScientistsSays.bin` | Identifies which biography scholar wrote a specific commentary |
| 67 | `NounsScientistsSays.ID=NounsRelations.SayID` | `NounsScientistsSays.ID` | `NounsRelations.SayID` | `NounsScientistsSaysNounsRelations.bin` | Links narrator relation records to specific scholarly opinions |
| 68 | `NounsStat1.ID=NounsBooks.BookID` | `NounsStat1.ID` | `NounsBooks.BookID` | `NounsStat1NounsBooks.bin` | Connects narrator stats to their books |
| 69 | `Subject.ID=SubjectHit.SubjectID` | `Subject.ID` | `SubjectHit.SubjectID` | `SubjectSubjectHit.bin` | Links subjects to thematic classifications |

---

## 4. Key Table Dictionary

Here are details of the most critical tables in the database system:

### 4.1. `Book`
Stores metadata about the Hadith collection books compiled in the encyclopedia (e.g., Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud).
* **`ID`** (`INT`, Primary Key): Book identifier.
* **`Title`** (`MEDIUMTEXT`): Full Arabic name of the book.
* **`Summary`** (`MEDIUMTEXT`): Narrative description or metadata about the book.
* **`AuthorID`** (`INT`): Author identifier (foreign key to `Authors`).
* **`MousanefID`** (`INT`): Identifier mapping compilers.

### 4.2. `BookTOC_Hadith`
The main table representing the Table of Contents, Chapters, and the actual Hadith paragraph contents.
* **`MainID`** (`INT`, Primary Key): Unique ID for each paragraph or TOC node.
* **`BookID`** (`INT`): Book identifier.
* **`BookName`** (`VARCHAR`): Cached book name.
* **`ID`** (`INT`): Numeric sequence.
* **`Content`** (`MEDIUMTEXT`): The raw text of the Hadith or section title, marked with HTML-like service tags.
* **`ParentID`** (`INT`): Hierarchical parent ID (supports nested chapters).
* **`IsLeaf`** (`TINYINT`): Boolean flag indicating if this is a leaf node (i.e. actual Hadith text).
* **`IsParagraph`** (`TINYINT`): Indicates if this is text body vs title.
* **`ParagraphID`** (`INT`): Paragraph ordering ID.
* **`NextParagraphID`** / **`PrevParagraphID`** (`INT`): Doubly-linked list pointers for sequential reading.
* **`LeftValue`** / **`RightValue`** (`INT`): Mapped nested set indices for high-performance sub-tree querying.

### 4.3. `Nouns`
The core directory of narrators (rawat) spanning the first three centuries of Islam.
* **`ID`** (`INT`, Primary Key): Narrator ID.
* **`Name`** (`MEDIUMTEXT`): Full biographical name including lineage (Nasab) and titles.
* **`Grade`** (`MEDIUMTEXT`): Synthesized credibility rank (e.g., Thiqah [trustworthy], Da'if [weak]).
* **`Tabaqa`** (`MEDIUMTEXT`): Generational layer (Tabaqa) relative to the Prophet's companions.
* **`DeathYear`** (`MEDIUMTEXT`): Hijri year of death (represented as string).
* **`DeathYearNum`** (`INT`): Numeric value of Hijri year of death.
* **`BirthYear`** (`MEDIUMTEXT`): Hijri year of birth.

### 4.4. `Asaned`
Stores individual chains of transmission. A chain (Isnad) is represented as a space-separated string of narrator IDs.
* **`ID`** (`INT`, Primary Key): Unique chain ID.
* **`SandRwah`** (`MEDIUMTEXT`): Space-separated list of narrator IDs ordered from top of the chain (Companion) to bottom (Author).
* **`SandTypes`** (`VARCHAR`): Structural type of the chain.
* **`HadithsCount`** (`INT`): Number of Hadiths supported by this chain.

### 4.5. `AsanedHadiths`
Associates transmission chains (`Asaned`) with the specific Hadiths (`BookTOC_Hadith`) they validate.
* **`HadithMainID`** (`INT`, Indexed): ID of the Hadith text (foreign key to `BookTOC_Hadith`).
* **`BookID`** (`INT`): Book identifier.
* **`SanadID`** (`INT`, Indexed): ID of the Isnad (foreign key to `Asaned`).
* **`SanadType`** (`INT`): Type of the chain link.
* **`SanadTahdethID`** (`INT`): Foreign key to narrator verbs (`AsanedTahdeth`).
* *Note: This table does not have a single column PRIMARY KEY due to duplicate HadithMainID values (multiple transmission chains per Hadith). It is optimized via non-unique composite index files.*
