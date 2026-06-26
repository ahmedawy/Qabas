# Legacy System Screens and Functions Document

This document maps all the primary screens, features, navigation triggers, and interactive elements of the legacy **Prophetic Sunnah Encyclopedia** (شركة حرف - جامع السنة النبوية) desktop client, linking them directly to our relational MySQL database schema.

---

## 1. Screen: Main Navigation & Document Browser

This is the default view where users explore the books and chapters. It consists of a split-pane layout: a **left tree-view pane** for navigation and a **right HTML browser pane** for document reading.

### 1.1. Table of Contents (TOC) Browser (Left Pane)
- **Functions**:
  - Displays the hierarchical structure of chapters, sub-chapters, and titles.
  - Expand/collapse nodes to navigate.
- **Database Mappings**:
  - `book` - List of collection books (e.g. Sahih al-Bukhari).
  - `booktoc_hadith` - Tree structure of chapters, where `ParentID` connects sub-nodes, and `IsLeaf = 0` represents categories/headings.
  - **Query**:
    ```sql
    SELECT MainID, Tarf, ParentID, IsLeaf FROM booktoc_hadith 
    WHERE BookID = :book_id ORDER BY LeftValue;
    ```

### 1.2. Document Reading Viewer (Right Pane)
- **Functions**:
  - Displays the selected chapter text or Hadith paragraphs.
  - Styles elements dynamically using the stylesheet `HadithXSL.xsl`.
  - Shows page index indicators matching the print version (Volume / Page).
- **Database Mappings**:
  - `booktoc_hadith.Content` - Custom HTML-like text of the Hadiths.
  - `booktoc_hadith.PartNum` & `booktoc_hadith.PageNum` - Volume/page references (mapped in XSLT as `<الصفحات>` -> `[جزء/صفحة]`).

---

## 2. Screen: Full-Text & Morphological Search

Allows users to search across the entire Hadith database or filter by book collections.

### 2.1. Basic Search Functions
- **Keyword Match**: Simple full-text search matching verbatim characters.
- **Root/Morphological Search (Harf Morphological Engine)**:
  - Searches by Arabic root words (e.g. searching "كتب" matches "يكتب", "كتاب", "مكتوب").
  - Mapped in XSLT template `<MMHit>` which highlights matched stems using `<span class="Highlight">`.
- **Database Mappings**:
  - Queries filtered by `IsLeaf = 1` in `booktoc_hadith`.
  - Uses the custom database function `normalize_arabic(Content)` to search diacritic-free.

---

## 3. Screen: Narrator Biography & Card Profile

Triggered by clicking on a narrator's name (`<راوي>`) in a Hadith text or via the Narrator Directory search.

### 3.1. Narrator Profile Card
- **Functions**:
  - Displays full genealogical details (Nasab), patronymic titles (Kunyah), and place of origin.
  - Shows birth and death Hijri dates.
  - Displays historical cities they travelled to for seeking Hadith knowledge.
- **Database Mappings**:
  - `nouns` table - Contains name details: `Name`, `AbbName`, `Kunia`, `Laqab`, `Nasab`, `BirthCity`, `DeathCity`, `LivingCity`, `JourneyCity`, `JourneyDate`.

### 3.2. Scholarly Evaluations (Jarh wa Ta'dil)
- **Functions**:
  - Lists the reviews and authenticity evaluations of the narrator written by classical scholars.
  - Displays an auto-synthesized grade summarizing their trustworthiness.
- **Database Mappings**:
  - `nouns.MartabaIbnHajar` - Evaluation by Ibn Hajar.
  - `nouns.MartabaZahabi` - Evaluation by Al-Dhahabi.
  - `nounsscientistssays` joined with `nounsscientists` - Narrative comments from multiple scholars regarding this narrator.

---

## 4. Screen: Transmission Chain (Sanad) Visualizer

Displays the chain of transmission (Isnad) from the Prophet Muhammad (PBUH) through the narrators down to the compiler (e.g. Imam al-Bukhari).

### 4.1. Narrator Connection Tree
- **Functions**:
  - Draws a graph network representing how the Hadith traveled.
  - Shows student-teacher links (clicking on a narrator node opens their bio card).
  - Triggers legacy protocol: `AsaneedReportRawyID:{@ID}`.
- **Database Mappings**:
  - `asanedhadiths` - Maps the `HadithMainID` to a specific `SanadID`.
  - `asaned` - Stores the sequence in `SandRwah` as space-separated narrator IDs (e.g. ` 4677 4494 5443 6932 2478 3654 5495 `).
  - `nounsshyoukhtalamize` - Maps narrator sheikhs (teachers) and talamidh (students) to build the graph links.

---

## 5. Screen: Scholarly Reports & Auxiliary Services

When reading a Hadith (where `IsLeaf = 1`), a menu bar provides access to scholarly services:

### 5.1. Takhreeg (Cross-References)
- **Functions**:
  - Lists other Hadith collections that compile the same Hadith text.
  - Displays simple, medium, or detailed Takhreej (mapped to XSLT templates: `TakhreegSimple`, `TakhreegMuton`).
- **Database Mappings**:
  - `htakhreeg` - Cross-references list.
  - `booktoc_hadith.BooksTakhreej` - Pre-computed Takhreej summary text.

### 5.2. Motaba'at (Corroborating Chains)
- **Functions**:
  - Lists parallel transmission chains (with different teachers/students) that corroborate the same narration text.
- **Database Mappings**:
  - `hmatncomparison1` to `hmatncomparison33` - Variance mappings comparing narrations.
  - `hadithshawahed` - Matches supporting chains.

### 5.3. Hadith Authenticity (Judgments)
- **Functions**:
  - Displays evaluations of the Hadith's authenticity (e.g., Sahih, Hasan, Da'if) by classical and modern محدثين (scholars).
- **Database Mappings**:
  - `hadithjudgmenthits` joins `hadithjudgmentsays` joins `hadithjudgmentscientists`.

### 5.4. Lexicon Word Definitions (Ghareeb)
- **Functions**:
  - Displays definitions of difficult vocabulary words in the Hadith.
  - Clicking on a word tagged with `<غريب ربط="ID">` retrieves the definition from the dictionary.
- **Database Mappings**:
  - `lexiconitems` & `lexicondescrp` - Stores the lexicon terms and their descriptive Arabic explanations.

---

## 6. Legacy Actions and Navigation Protocol Mapping

The legacy ActiveX control uses custom URL schemas to pass parameters from HTML text clicks back to the WPF container. We map these to web API routes:

| Legacy WPF Action Schema | Target Web Route / UI Action | Description |
|---|---|---|
| `HadithActivation_{@Value}` | `/hadith.html?id={Value}` | Activates and displays a specific Hadith body |
| `AsaneedReportRawyID:{@ID}` | `/narrator.html?id={ID}` | Opens the Narrator profile visualizer |
| `ServiceBookNewChild- DDDD{@MainID}` | `/service.html?id={MainID}` | Opens auxiliary commentary or lexicon popups |
