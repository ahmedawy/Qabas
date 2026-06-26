# Reverse Engineering Notes: Prophetic Sunnah Encyclopedia

This document details the reverse engineering findings and architecture of the **Prophetic Sunnah Encyclopedia - Portable** (جامع السنة النبوية) software developed by **Harf Information Technology** (شركة حرف لتقنية المعلومات). It serves as a guide for engineers working on future reverse engineering or migration tasks for this or other Harf products.

---

## 1. Application Architecture

The application is a hybrid desktop application combining a **.NET 2.0 (WPF) GUI**, **C++ native engines**, and an **embedded HTML renderer** (ActiveX WebBrowser component) for document display.

### 1.1. Core Executable and DLL Dependencies
* **`HadithEncyProj.exe`**: A .NET v2.0 assembly. It serves as the primary GUI wrapper, handling user inputs, searches, window navigation, and layout.
* **`BuraqLib.dll` / `Engine0200.dll` / `LibCore0200.dll`**: The core native database engine, historically referred to as the **Buraq Engine**. It is written in C++ and performs index lookups, keyword indexing, morphological root stemming (for Arabic search), and table joining.
* **`HarfMMMP01.dll`**: Handles morphological analysis (root/stem extraction) for Arabic query parsing, enabling the application to match search terms with different prefixes and suffixes.
* **`ToolkitPro1122vc80.dll` (and derivatives)**: Codejock ToolkitPro UI styling DLLs. They parse skin styles (`.cjstyles` and `.msstyles` in the `Styles/` directory) to give the application its theme (e.g., Office 2007, WinXP Luna, iTunes).
* **`GraphSharp.dll` / `QuickGraph.dll` / `WPFExtensions.dll`**: Used to draw the narrator tree diagrams and transmission chains (Asaneed trees) dynamically in WPF.
* **`AsaneedReport.dll`**: Renders narrator report diagrams and charts.

---

## 2. Proprietary Database Structure (Buraq Engine)

The database resides in `Data\HadithDB`. Instead of a single SQL database file (like SQLite), it uses a proprietary directory-based layout.

### 2.1. Table Storage on Disk
Each table is represented as a directory inside `Data\HadithDB\`. For example, the `Authors` table is at `Data\HadithDB\Authors\`.
Within a table directory, the data is partitioned into:
* **`Catalog.xml`**: Local table metadata, indicating column fields, data sizes, and indices.
* **`ID/` Directory**: Binary files mapping numeric record IDs to record offsets.
* **`Text/` Directory**: Stores the actual raw string and binary column contents.
* **`Dic/` Directory**: Local keyword dictionaries used for indexing text fields.

### 2.2. Relationships Folder (`Relations/`)
Relationships are not stored inside the tables. Instead, the Buraq Engine utilizes physical index files inside `Data\HadithDB\Relations\`.
* Each relationship is named as `Table1Table2.bin` (e.g., `BookBookTOC_Hadith.bin`).
* These `.bin` files are binary arrays mapping Primary Key IDs from the primary table directly to Record IDs in the foreign table. This speeds up JOIN operations without requiring runtime SQL evaluation.
* The mapping of these files to logical foreign key constraints is defined at the end of the global `Data\HadithDB\Catalog.xml` file.

---

## 3. Client Display & Rendering System

The desktop client renders Hadith texts, search listings, and narrator bios using an embedded Internet Explorer rendering component. 

### 3.1. Template System (`base.html`)
The application loads a static template [base.html](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/base.html) which includes:
* Embedded CSS styling sheet defining colors and typography (e.g., `.Matn` for Hadith text body, `.HadithNum` for numbering, `.Highlight` for search hits).
* Core scripts to handle internal hyperlink clicks (e.g., calling desktop event handlers via URL schemes like `HadithActivation_<ID>`).

### 3.2. XML to HTML Transformation (XSLT)
When a user clicks on a book, chapter, or search result, the Buraq Engine retrieves the record as raw XML. The client then applies an XSLT transformation to convert the XML into HTML before pushing it to the rendering browser control.

The XSL stylesheets are encoded in **UTF-16 Little Endian (UTF-16LE)**. Key files include:
* [HadithXSL.xsl](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/HadithXSL.xsl): Renders the main Hadith text page.
* [PaneXSL.xsl](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/PaneXSL.xsl): Renders side navigation and table of contents.
* [TakhreegXSL.xsl](file:///d:/IslamicPro/Prophetic%20Sunnah%20Encyclopedia%20-%20Portable/TakhreegXSL.xsl): Formats Hadith cross-reference reports.

#### Key XSLT Tag Mappings:
* `<متن>` -> `<span class="Matn">`: Renders the main body of the Hadith in bold, dark blue.
* `<سند_مخفي>` -> Hidden span: Contains the chain of narrators which can be toggled via a "Show Chain" button.
* `<الصفحات>` -> `[جزء/صفحة]`: Renders print volume and page numbers inline in gray.
* `<رقم_حديث_للعرض>` -> `<span class="HadithNum">`: Formats the Hadith index number.

---

## 4. Reversing and Migrating to MySQL

To migrate a Harf-based database to MySQL:

1. **Extract Schemas**: Analyze the local table catalogs or extract data using reflection from the .NET assemblies or COM calls.
2. **Handle Large SQL Packet Sizes**:
   Because tables like `BookTOC_Hadith` and `BookTOC_Services` contain entire books inside single columns, their corresponding `.sql` files contain very large INSERT statements.
   * **Important Variable**: Ensure the MySQL/MariaDB server `max_allowed_packet` is raised to `1073741824` (1 GB) before running the import:
     ```sql
     SET GLOBAL max_allowed_packet = 1073741824;
     ```
3. **Session Optimization**:
   Import files using the `source` command with foreign keys and unique key checks disabled to bypass performance bottlenecking:
   ```sql
   SET FOREIGN_KEY_CHECKS = 0;
   SET UNIQUE_CHECKS = 0;
   SET AUTOCOMMIT = 0;
   source MySQL2/Table.sql;
   COMMIT;
   ```
4. **Translate Relations**:
   Map the 69 binary relations defined at the end of `Catalog.xml` into relational database constraints (`FOREIGN KEY` references or compound indexes) to ensure data integrity.
