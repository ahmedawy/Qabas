# Arabic Hadith Search Architecture Implementation Plan

This document outlines the architecture for a high-performance, 2-column Arabic search engine utilizing MySQL FULLTEXT indexes and the `ar-php` library. This approach explicitly avoids external search services (like Elasticsearch) and heavy algorithmic stemming to fit within shared hosting constraints while meeting complex search requirements.

## 1. Database Schema & Multi-Field Indexing

We will extend the existing `BookTOC_Hadith` table with two optimized columns specifically designated for search. This allows us to handle different search types without applying complex string manipulation functions at query-time, which would prevent index usage.

### SQL Migration

```sql
-- Phase 1: Add new columns for the normalized text and stemmed text
ALTER TABLE BookTOC_Hadith
ADD COLUMN search_exact TEXT DEFAULT NULL COMMENT 'Normalized text without diacritics',
ADD COLUMN search_stemmed TEXT DEFAULT NULL COMMENT 'Stemmed text stripped of prefixes and suffixes';

-- Phase 2: Create FULLTEXT indexes on the new columns for MATCH() AGAINST() queries
ALTER TABLE BookTOC_Hadith
ADD FULLTEXT INDEX idx_search_exact (search_exact),
ADD FULLTEXT INDEX idx_search_stemmed (search_stemmed);
```

> [!NOTE]
> The original Hadith text columns (e.g., `Text`, `Narrators`) will remain untouched for presentation purposes. The new columns act as hidden search indexes.

## 2. The Ingestion Pipeline (`ar-php`)

The Ingestion Pipeline is responsible for processing Hadith text before it is inserted or updated in the database. It normalizes the text to ensure uniformity and strips prefixes/suffixes for root/stem searches.

### `ArabicSearchIngestionService.php`

```php
<?php

require_once 'I18N/Arabic.php';

class ArabicSearchIngestionService
{
    private I18N_Arabic $arabicNormalizer;
    private I18N_Arabic $arabicStemmer;

    public function __construct()
    {
        // Initialize ar-php classes
        $this->arabicNormalizer = new I18N_Arabic('Normalise');
        $this->arabicStemmer = new I18N_Arabic('Stemmer');
    }

    /**
     * Prepares exact text by removing diacritics and normalizing characters.
     */
    public function prepareExact(string $text): string
    {
        // 1. Strip Tashkeel (diacritics) using ar-php
        $text = $this->arabicNormalizer->stripTashkeel($text);

        // 2. Normalize common Arabic characters to a single form for exact matching
        // Normalizing Alifs (أ, إ, آ to ا)
        $text = preg_replace('/[أإآ]/u', 'ا', $text);
        
        // Normalizing Taa Marbuta to Haa (ة to ه)
        $text = preg_replace('/ة/u', 'ه', $text);
        
        // Normalizing Yaa to Alif Maksura (ي to ى)
        $text = preg_replace('/ي/u', 'ى', $text);

        return trim($text);
    }

    /**
     * Prepares stemmed text by stripping common prefixes and suffixes.
     */
    public function prepareStemmed(string $text): string
    {
        // Always start from an exact/normalized baseline
        $exactText = $this->prepareExact($text);
        
        $words = explode(' ', $exactText);
        $stemmedWords = [];

        foreach ($words as $word) {
            // ar-php stemmer performs light stemming (stripping prefixes like ال, ب, ك, و and suffixes)
            // It is less aggressive than the Khoja stemmer, preserving the core word structure.
            if (mb_strlen($word) > 2) {
                $stemmedWords[] = $this->arabicStemmer->stem($word);
            } else {
                $stemmedWords[] = $word;
            }
        }

        return implode(' ', $stemmedWords);
    }
}
```

> [!TIP]
> When importing the legacy data, run a background PHP script to select all rows, process their text fields through `prepareExact()` and `prepareStemmed()`, and update the `search_exact` and `search_stemmed` columns.

## 3. The Search Query Builder (Controller)

The search controller translates the frontend UI parameters into the correct `MATCH() AGAINST()` Boolean queries. 

### `ArabicSearchController.php`

```php
<?php

class ArabicSearchController
{
    private PDO $db;
    private ArabicSearchIngestionService $ingestionService;

    public function __construct(PDO $db, ArabicSearchIngestionService $ingestionService)
    {
        $this->db = $db;
        $this->ingestionService = $ingestionService;
    }

    /**
     * Executes the search based on UI parameters.
     */
    public function search(array $params): array
    {
        $phrase = $params['phrase'] ?? '';
        $searchType = $params['search_type'] ?? 'exact'; // 'exact' (مطابق), 'partial' (مطابق جزئيا), 'stem' (بالجذر واللواصق)
        $wordOrder = $params['word_order'] ?? 'any';     // 'sequential' (متتالية), 'scattered' (مبعثرة), 'any' (أي من الكلمات)
        $scope = $params['scope'] ?? 'text';             // Target columns (المتون, أسماء الرواة) mapped to table

        if (empty(trim($phrase))) {
            return [];
        }

        // 1. Determine which index column to target and process the user input
        if ($searchType === 'stem') {
            $columnToSearch = 'search_stemmed';
            $processedInput = $this->ingestionService->prepareStemmed($phrase);
        } else {
            // Both 'exact' and 'partial' use the exact index
            $columnToSearch = 'search_exact';
            $processedInput = $this->ingestionService->prepareExact($phrase);
        }

        // 2. Build the Boolean Query
        $matchAgainstQuery = $this->buildMatchAgainstQuery($processedInput, $wordOrder, $searchType);

        if (empty($matchAgainstQuery)) {
            return [];
        }

        // 3. Execute the SQL Query
        // (Assuming searching within BookTOC_Hadith. $scope could dynamically alter table joins or select columns)
        $sql = "
            SELECT id, text, narrators 
            FROM BookTOC_Hadith 
            WHERE MATCH({$columnToSearch}) AGAINST(:query IN BOOLEAN MODE)
            LIMIT 100
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['query' => $matchAgainstQuery]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Translates word order and search type into MySQL Boolean syntax.
     */
    private function buildMatchAgainstQuery(string $input, string $wordOrder, string $searchType): string
    {
        $words = array_filter(explode(' ', trim($input)));
        if (empty($words)) {
            return '';
        }

        $booleanQuery = '';

        // Handle Word Order
        if ($wordOrder === 'sequential') {
            // Sequential (متتالية): Wraps phrase in double quotes -> "word1 word2"
            $booleanQuery = '"' . implode(' ', $words) . '"';
        } elseif ($wordOrder === 'scattered') {
            // Scattered (مبعثرة): Prepends '+' to mandate every word -> +word1 +word2
            $booleanQuery = implode(' ', array_map(fn($w) => '+' . $w, $words));
        } elseif ($wordOrder === 'any') {
            // Any Word (أي من الكلمات): Standard OR logic -> word1 word2
            $booleanQuery = implode(' ', $words);
        }

        // Handle Partial/Stem Wildcards
        // FULLTEXT supports wildcard '*' at the end of tokens in boolean mode (e.g. +word*)
        if ($searchType === 'stem' || $searchType === 'partial') {
            if ($wordOrder === 'scattered' || $wordOrder === 'any') {
                // Add wildcard to each token
                $tokens = explode(' ', $booleanQuery);
                $tokensWithWildcards = array_map(fn($t) => $t . '*', $tokens);
                $booleanQuery = implode(' ', $tokensWithWildcards);
            }
            // Note: MySQL InnoDB FULLTEXT does not support wildcards *inside* double quotes ("word*").
            // Sequential + Partial is limited. If required, it would need a fallback to `LIKE '%word1 word2%'`.
        }

        return $booleanQuery;
    }
}
```

## User Review Required

> [!IMPORTANT]
> - **MySQL `innodb_ft_min_token_size`**: By default, MySQL FULLTEXT indexes ignore words under 3 characters (InnoDB) or 4 characters (MyISAM). Arabic stems are frequently 2 or 3 letters (e.g., "قل", "كتب"). You must update `my.cnf` to set `innodb_ft_min_token_size = 2` and rebuild the indexes if your hosting environment permits, or accept that 2-letter words will be ignored.
> - **Sequential + Partial Limitation**: MySQL does not support wildcards *inside* phrase quotes (`AGAINST('"phrase*"' IN BOOLEAN MODE)`). The controller handles this by skipping the wildcard if `word_order == 'sequential'`. If true partial sequential matching is absolutely required, it may necessitate falling back to a `LIKE` query. Is this acceptable?
> - **Data Backfill**: This plan requires running a script once to backfill the `search_exact` and `search_stemmed` columns for all existing rows in `BookTOC_Hadith`.

Please review this implementation plan. Click **Proceed** to approve.
