# Database Tables & Screen Mapping Report

This report documents the 98 SQL tables extracted into the `MySQL2` directory. It categorizes them into their core logical modules, explains how they are connected, and maps them to the specific screens and features where they are used in the application.

---

## 1. Core Hadith Text Module (كتب المتون)

These tables store the actual text of the Hadiths, the hierarchical books they belong to, and grouped variants.

*   **`Book`**: Stores the metadata for all books (e.g., Sahih Bukhari, Sahih Muslim). Connected to `BookTOC_Hadith` via `ID`.
*   **`BookTOC_Hadith`**: The absolute core table. Stores chapters (IsLeaf=0) and actual Hadith texts (IsLeaf=1).
*   **`HCompoundMatn` & `HGamhAlMatn`**: Stores grouped or combined Hadith variations (المتون المجمعة).
*   **`Pages`**: Maps Hadiths to their physical print volume/page numbers.
*   **`Amthal`**: Maps Hadiths to specific prophetic proverbs (أمثال الحديث).
*   **`MatnDates`**: Links Hadiths to specific historical events or years (تواريخ المتون).

### 🖥️ Where it's used:
*   **Hadith Books Viewer** (`/viewmtnbooks.html`): Displays the full Hadith text, navigating via the `BookTOC_Hadith` tree.
*   **Incipits List** (`/viewatraflist.html`): Uses `BookTOC_Hadith.Tarf` to list the opening words of Hadiths alphabetically.
*   **Combined Matns** (`/groupedmtn.html`): Uses `HGamhAlMatn` and `HCompoundMatn` to show merged Hadith texts.
*   **Hadith Proverbs** (`/viewamthal.html`): Queries `Amthal` to show parables and their corresponding text.
*   **Muton Dates** (`/viewmutondates.html`): Uses `MatnDates` to map Hadiths to historical timelines.

---

## 2. Narrators & Biographies Module (الرواة)

The most complex module, storing the biographies, lineages, and relationships of the narrators.

*   **`Nouns`**: The central dictionary of narrators (Rawat). Stores Name, Kunia, Nasab, DeathYear, etc.
*   **`NounsRelations` & `NounsShyoukhTalamize`**: Connects records in `Nouns` to other records in `Nouns` to build Teacher (Sheikh) and Student (Talamidh) relationships.
*   **`NounsBooks`**: Connects a Narrator (`Nouns.ID`) to the `Book` they authored or narrated.
*   **`NounsTranslation`**: Stores extended biographical text.
*   **`NounsRelationsTypes`**: Maps specific types of historical classifications for narrators.

### 🖥️ Where it's used:
*   **Narrators Directory** (`/viewrwah.html`): The main search grid. Uses `Nouns` to filter by Name, Kunia, or Nasab.
*   **Narrator Profile Card**: An 8-tab popup displaying biography (`Nouns`), Teachers/Students (`NounsShyoukhTalamize`), and references.
*   **Places Lexicon** (`/viewlexiconplaces.html`): Uses `Nouns.BirthCity` and `Nouns.LivingCity` to list narrators by geography.
*   **Book Narrators** (`/viewrwahbooks.html`): Uses `NounsBooks` to filter narrators by the books they appear in.

---

## 3. Chains of Transmission Module (الأسانيد)

Tables responsible for drawing the "Asaneed" (Chains) connecting a Hadith back to the Prophet.

*   **`Asaned`**: Represents a unique transmission chain (a string of Narrator IDs).
*   **`AsanedHadiths`**: The junction table connecting a transmission chain (`Asaned.ID`) to a specific Hadith text (`BookTOC_Hadith.MainID`).
*   **`AsanedTree`**: Caches the graph structure required to draw the visual tree diagram.
*   **`AsanedTahdeth` & `AsanedTypes`**: Stores the specific transmission verbs (e.g., "heard from", "narrated to us").

### 🖥️ Where it's used:
*   **Chains Incipits** (`/viewatrafasaned.html`): Searches through `AsanedHadiths` joined with `Nouns` (Companions) to list Hadiths by their transmission origin.
*   **Terminology Apps** (`/viewexpressiontree.html`): Uses `AsanedTahdeth` to browse the precise transmission vocabulary.
*   **Asaneed Tree Diagram**: Draws the visual graph in the UI using `AsanedTree`.

---

## 4. Scholarly Evaluations Module (الجرح والتعديل)

Tracks how historical scholars graded both the Narrators and the Hadiths themselves.

*   **`HadithJudgmentSays` & `HadithJudgmentHits`**: Links a Hadith (`BookTOC_Hadith.MainID`) to an authenticity grade (e.g., Sahih, Da'if) issued by a specific scholar.
*   **`HadithJudgmentScientists`**: The scholars who issue the Hadith grades.
*   **`NounsGarh` & `NounsGarhLinks`**: Stores specific critique words (Jarh wa Ta'dil) assigned to narrators.
*   **`NounsScientistsSays`**: Stores lengthy textual opinions written by scholars about a specific narrator.

### 🖥️ Where it's used:
*   **Hadith Grade Explorer** (`/viewscsayhadith.html`): Queries `HadithJudgmentHits` to display if a Hadith is authentic or weak, and according to whom.
*   **Critique Words** (`/viewrwahgarh.html`): Displays specific critique vocabulary from `NounsGarh`.
*   **Bio Opinions** (`/viewscientistssayinginrwah.html`): Uses `NounsScientistsSays` to show what critics said about a specific narrator.

---

## 5. Lexicon & Thematic Subjects Module (معاجم وموضوعات)

Categorizes Hadiths by topic and defines unfamiliar words.

*   **`Subject` & `SubjectHit`**: A hierarchical tree (`Subject`) of Islamic topics (e.g., Prayer, Fasting). `SubjectHit` links a topic ID to a Hadith ID (`BookTOC_Hadith.MainID`).
*   **`LexiconItems` & `LexiconDescrp`**: A dictionary of obscure Arabic words (Ghareeb) found in the Hadiths and their definitions.

### 🖥️ Where it's used:
*   **Thematic Tree** (`/viewsubjecttree.html`): A nested explorer built from `Subject`. Clicking a node queries `SubjectHit` to show all related Hadiths.
*   **Lexicon / Ghareeb** (`/viewlexiconghareeb.html`): When a user clicks a highlighted obscure word in a Hadith, the app queries `LexiconDescrp` to show the definition popup.

---

## 6. Variant Comparisons Module (المقارنات والزوائد)

A massive set of 33 tables used for deep textual comparison.

*   **`HMatnComparison1` through `HMatnComparison33`**: Pre-calculated tables linking a "Master" Hadith to its variations ("Slave") across different transmission chains to spot differences in text.
*   **`ExpRawyModbaj`**: Tracks "Additions" (Zawa'id) brought by specific narrators not found in the original collections.

### 🖥️ Where it's used:
*   **Agreed & Additions** (`/viewatrafextra.html`): Queries the `HMatnComparison` tables to show text variations.
*   **Narrator Additions** (`/viewrwahextra.html`): Uses `ExpRawyModbaj`.

---

## 7. Quranic & General Indexes (الفهارس)

Cross-references external sources like the Quran, Poetry, and General Names.

*   **`QuranAyat` & `QuranAyatDescrp`**: A complete index of Quranic verses. It maps a verse to the Hadith that quotes it or explains it.
*   **`Index` & `IndexItem`**: A unified indexing system. For example, IndexID `3` tracks general Names, while IndexID `14` tracks Poetry verses quoted in Hadiths.

### 🖥️ Where it's used:
*   **Quran Verses Index** (`/viewindexitems_indexid_2.html`): Allows users to find Hadiths by searching for a specific Ayah.
*   **Names Index** (`/viewindexitems_indexid_3.html`): Finds mentions of historical figures who aren't necessarily narrators.
*   **Poetry Index** (`/viewindexitems_indexid_14.html`): Finds Hadiths that quote specific poems.

---

## Summary of Relationships (Joins)
In the new MySQL architecture, nearly every feature revolves around joining peripheral tables back to two central anchors:
1.  **`BookTOC_Hadith.MainID`** (The anchor for all text, subjects, and chains).
2.  **`Nouns.ID`** (The anchor for all biographies, critiques, and books).
