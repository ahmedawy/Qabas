<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

class SunnahFeaturesTest extends TestCase
{
    /**
     * Test the Mosannafat statistics endpoint.
     */
    public function test_mosannafat_stats_returns_valid_data(): void
    {
        $response = $this->get('/api/v1/stats_mosannafat?book1=1&book2=2');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'book1' => [
                'id',
                'title',
                'total',
                'additions',
            ],
            'book2' => [
                'id',
                'title',
                'total',
                'additions',
            ],
            'agreed',
        ]);

        $response->assertJsonPath('success', true);
        $response->assertJsonPath('book1.id', 1);
        $response->assertJsonPath('book2.id', 2);
    }

    /**
     * Test the Hadith Detail endpoint returns the new Takhreej, Shawahed, and Combined Matn fields.
     */
    public function test_hadith_detail_contains_takhreej_and_shawahed(): void
    {
        // Hadith ID 5 is Bukhari Hadith #1 (Innamal a'malu bin niyyat)
        $response = $this->get('/api/v1/hadith/takhreej?id=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'book_name',
            'hadith_num',
            'book_id',
            'takhreej',
            'shawahed' => [
                'has_shawahed',
                'comparisons',
            ],
            'combined_matn' => [
                'id',
                'clean_matn',
                'matn_annotations',
                'asaned_comp',
                'scholarly_matn',
                'scholarly_sources',
                'scholarly_segments',
            ],
        ]);
        $response->assertJsonPath('success', true);
        $this->assertNotNull($response->json('combined_matn'));
    }

    /**
     * Test the Atraf List endpoint supports Arabic letter filtering.
     */
    public function test_atraf_list_supports_alphabetical_filter(): void
    {
        $response = $this->get('/api/v1/atraf_list?books=1&letter=أ');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'results',
        ]);
        $response->assertJsonPath('success', true);
    }

    /**
     * Test the booktoc_services adjacency list features.
     */
    public function test_booktoc_services_adjacency_features(): void
    {
        $leaves = \App\Models\BookTocService::getDescendantLeaves(297406);
        $this->assertNotEmpty($leaves);

        $node = \App\Models\BookTocService::where('MainID', 297407)->first();
        $this->assertNotNull($node);
        $ancestors = \App\Models\BookTocService::getAncestors($node);
        $this->assertNotEmpty($ancestors);
        $this->assertEquals(297406, $ancestors->first()->MainID);
    }

    /**
     * Test the split books endpoints and category ranges.
     */
    public function test_split_books_endpoints(): void
    {
        // 1. Hadith books
        $response = $this->get('/api/v1/hadith-books');
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure(['success', 'books']);
        $books = $response->json('books');
        foreach ($books as $book) {
            $this->assertLessThanOrEqual(33, $book['ID']);
        }

        // 2. Service books
        $response2 = $this->get('/api/v1/service-books');
        $response2->assertStatus(200);
        $response2->assertJsonPath('success', true);
        $books2 = $response2->json('books');
        foreach ($books2 as $book) {
            $this->assertGreaterThan(33, $book['ID']);
        }
    }

    /**
     * Test TOC endpoint with type parameters.
     */
    public function test_toc_with_type_parameters(): void
    {
        // Hadith book TOC
        $response = $this->get('/api/v1/toc?book_id=1&type=hadith');
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        // Service book TOC
        $response2 = $this->get('/api/v1/toc?book_id=34&type=service');
        $response2->assertStatus(200);
        $response2->assertJsonPath('success', true);
    }

    /**
     * Test the Matn Comparison endpoint returns master and slave hadiths.
     */
    public function test_matn_comparison_endpoint_returns_data(): void
    {
        $response = $this->get('/api/v1/hadith/matn-comparison?id=5');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'master' => [
                'main_id',
                'book_name',
                'hadith_num',
                'clean_content',
            ],
            'slaves',
        ]);
        $response->assertJsonPath('success', true);
    }

    /**
     * Test the Shawahed endpoint returns companion-filtered data.
     */
    public function test_shawahed_endpoint_returns_filtered_data(): void
    {
        $response = $this->get('/api/v1/hadith/5/shawahed');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'data' => [
                '*' => [
                    'book_id',
                    'book_name',
                    'takhreej_author',
                    'takhreej_book',
                    'companion_name',
                    'part',
                    'page',
                    'tarqeem',
                ]
            ]
        ]);
        $response->assertJsonPath('status', 'success');
        
        // Assert we got exactly 1 item for Hadith 5 matching legacy system
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('عبد الله بن مسعود', $data[0]['companion_name']);
    }
}
