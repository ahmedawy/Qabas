# Prophetic Sunnah Encyclopedia (جامع السنة النبوية) - Developer Guide & Reverse Engineering Notes

This repository contains the portable edition of the **Prophetic Sunnah Encyclopedia** (جامع السنة النبوية) originally developed by **Harf Information Technology** (شركة حرف لتقنية المعلومات). This guide contains architectural documentation, database mappings, and instructions for migrating the legacy proprietary database to MySQL/MariaDB.

---

## 1. Desktop Application Architecture

The application is a hybrid Windows desktop app compiled for the **.NET 2.0 Framework (WPF)**, utilizing native C++ libraries for database lookups and an embedded ActiveX WebBrowser control for content display.

### 1.1. Core Library Dependencies
* **`HadithEncyProj.exe`**: The main WPF executable. It manages navigation, user search forms, narrator tree displays, and layout settings.
* **`BuraqLib.dll` / `Engine0200.dll` / `LibCore0200.dll`**: The native C++ core, historically named the **Buraq Engine**. It handles data indexing, morphological query matching, and table operations.
* **`HarfMMMP01.dll`**: Performs Arabic morphological stemming, allowing searches to match root words regardless of prefixes/suffixes.
* **`ToolkitPro1122vc80.dll` (and variants)**: Codejock UI skinning library. It loads visual styles from the `Styles/` folder (e.g., `.cjstyles` and `.msstyles` skin assets).
* **`GraphSharp.dll` / `QuickGraph.dll` / `WPFExtensions.dll`**: Used in WPF to render dynamic narrator tree diagrams (transmission chains / Asaneed).

---

## 2. Proprietary Database Format (Buraq Engine)

The database is stored under the `Data\HadithDB\` folder. Rather than using standard SQL files, the Buraq Engine maps each database table to a physical directory.

### 2.1. Disk Structure of a Table
Within each table folder (e.g., `Data\HadithDB\BookTOC_Hadith\`), the schema is laid out as follows:
* **`Catalog.xml`**: Table schema definition defining columns and local indexing flags.
* **`ID/` Directory**: Contains binary index files mapping record IDs to seek offsets.
* **`Text/` Directory**: Contains the raw textual and binary table content.
* **`Dic/` Directory**: Contains local dictionary/index files used by the engine for rapid text searching.

### 2.2. Relations Folder (`Relations/`)
Relationships (foreign key equivalents) are cached physically on disk inside `Data\HadithDB\Relations\` as binary index arrays.
* Named as `Table1Table2.bin` (e.g., `BookBookTOC_Hadith.bin` mapping books to chapters).
* This design allows the desktop client to instantly join tables without parsing or evaluating SQL JOIN expressions.
* The logical definitions of these relationships are declared in the root [Catalog.xml](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/Data/HadithDB/Catalog.xml) file.

---

## 3. Client Rendering and XSLT System

Text display (Hadiths, narrator bios, lexicon definitions) is powered by local XML-to-HTML transformation:

1. The C++ engine retrieves the database record as raw XML.
2. The client applies a **UTF-16LE XSL stylesheet** to convert the XML structure into HTML.
3. The generated HTML is loaded into the ActiveX browser window using the styles defined in [base.html](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/base.html).

### Key Stylesheet mappings in `HadithXSL.xsl`:
* `<متن>` -> `<span class="Matn">`: Renders the main Hadith text in bold dark blue.
* `<سند_مخفي>` -> Hidden chain of narrators, toggled via JavaScript.
* `<الصفحات>` -> `[جزء/صفحة]`: Formats inline volume/page indices in gray.

---

## 4. Migrating the Database to MySQL

To migrate the encyclopedia data into a modern relational database:

### 4.1. SQL Dump Location
The legacy database tables have been exported to **98 `.sql` files** inside the [MySQL2/](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/MySQL2) directory.

### 4.2. Database Requirements & Optimized Setup
Because single rows in tables like `BookTOC_Hadith` contain entire books or large text chains, the MySQL server configuration must be optimized:

1. **Increase Packet Size Limit**: The MySQL global `max_allowed_packet` size must be set to **1 GB** to prevent import failures:
   ```sql
   SET GLOBAL max_allowed_packet = 1073741824;
   ```
2. **Prevent Arabic Encoding Corruption (Mojibake)**:
   > [!IMPORTANT]
   > On Windows, the standard `mysql.exe` client defaults to the console system code page (e.g., `cp1256` or `latin1`). Importing the UTF-8 SQL files without specifying the connection character set will result in double-encoding, making the Arabic text unreadable.
   > 
   > Always run the import client with:
   > `mysql --default-character-set=utf8mb4`

3. **Performance Tweaks**:
   Speed up imports by wrapping each file in a transaction and bypassing keys and constraint checks:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   SET UNIQUE_CHECKS = 0;
   SET AUTOCOMMIT = 0;
   source MySQL2/TableName.sql;
   COMMIT;
   ```

### 4.3. Important Troubleshooting Steps during Migration
During verification of the imported database, two major bugs in the source SQL files were found and resolved:

* **AsanedTree missing**: The `AsanedTree` table was omitted from the automated import sequence because of its size (74.8 MB). It was successfully manually imported using:
  ```sql
  mysql --default-character-set=utf8mb4 -u root hadithdb -e "SET FOREIGN_KEY_CHECKS=0; SET UNIQUE_CHECKS=0; SET AUTOCOMMIT=0; source MySQL2/AsanedTree.sql; COMMIT;"
  ```
* **AsanedHadiths empty**: The source SQL file `MySQL2/AsanedHadiths.sql` declared `PRIMARY KEY (HadithMainID)`. Since the database maps multiple narrator chains to single Hadith IDs, inserting duplicate keys failed and rolled back the transaction. This was fixed by replacing the primary key constraint with indexes:
  ```sql
  -- Modified schema definition inside AsanedHadiths.sql
  CREATE TABLE `AsanedHadiths` (
    `HadithMainID` INT,
    `BookID` INT,
    `SanadID` INT,
    `SanadType` INT,
    `SanadTahdethID` INT,
    KEY (`HadithMainID`),
    KEY (`SanadID`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ```
  After this modification, `AsanedHadiths.sql` was successfully imported, loading all **341,289 rows**.

---

## 5. Web Application Integration

A modern search backend can normalize Arabic text to enable diacritic-insensitive and orthographically normalized queries. A helper function `normalize_arabic` is defined inside the database:
```sql
-- Normalize Arabic function to strip diacritics and equate Alif letters
SELECT COUNT(*) FROM BookTOC_Hadith 
WHERE IsLeaf = 1 AND normalize_arabic(Content) LIKE normalize_arabic('%الاعمال بالنيات%');
```
This is exposed via the unified PHP backend REST API.
