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
        // Hadith ID 1 is Bukhari Hadith #1 (Innamal a'malu bin niyyat)
        $response = $this->get('/api/v1/hadith/takhreej?id=1');

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
            'combined_matn',
        ]);
        $response->assertJsonPath('success', true);
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
}
