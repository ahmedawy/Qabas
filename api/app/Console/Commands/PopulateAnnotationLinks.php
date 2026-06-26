<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PopulateAnnotationLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hadith:populate-annotation-links {--chunk=5000 : Rows per batch} {--fresh : Truncate and start from scratch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate the annotation_links table from booktoc_hadith and booktoc_services JSON Annotations columns.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');
        $fresh = (bool) $this->option('fresh');

        if ($fresh) {
            $this->info("Truncating annotation_links table...");
            DB::table('annotation_links')->truncate();
        }

        $this->info("Dropping indexes for faster bulk loading...");
        try {
            DB::statement('ALTER TABLE annotation_links DROP INDEX idx_tag_link');
        } catch (\Exception $e) {
            $this->warn("Index idx_tag_link does not exist or could not be dropped.");
        }
        try {
            DB::statement('ALTER TABLE annotation_links DROP INDEX idx_source');
        } catch (\Exception $e) {
            $this->warn("Index idx_source does not exist or could not be dropped.");
        }

        // Process booktoc_hadith
        $this->info("Processing booktoc_hadith annotations...");
        $this->processTable('booktoc_hadith', 'MainID', 'Annotations', $chunkSize);

        // Process booktoc_services
        $this->info("Processing booktoc_services annotations...");
        $this->processTable('booktoc_services', 'MainID', 'Annotations', $chunkSize);

        $this->info("Recreating indexes on annotation_links...");
        DB::statement('ALTER TABLE annotation_links ADD INDEX idx_tag_link (tag_type, link_id)');
        DB::statement('ALTER TABLE annotation_links ADD INDEX idx_source (source_table, source_id)');

        $this->info("All annotations populated successfully into annotation_links.");
        return 0;
    }

    /**
     * Process a table chunk by chunk.
     */
    private function processTable(string $table, string $primaryKey, string $jsonColumn, int $chunkSize): void
    {
        $lastProcessedId = DB::table('annotation_links')
            ->where('source_table', $table)
            ->max('source_id') ?? 0;

        $this->info("Processing rows in '{$table}' starting from ID {$lastProcessedId}...");
        $processedCount = 0;

        DB::table($table)
            ->select($primaryKey, $jsonColumn)
            ->whereNotNull($jsonColumn)
            ->where($primaryKey, '>', $lastProcessedId)
            ->orderBy($primaryKey)
            ->chunkById($chunkSize, function ($rows) use ($table, $primaryKey, $jsonColumn, &$processedCount) {
                $inserts = [];

                foreach ($rows as $row) {
                    $annotations = json_decode((string) $row->$jsonColumn, true);
                    if (!is_array($annotations)) {
                        continue;
                    }

                    foreach ($annotations as $ann) {
                        // We only link annotations that have a linkId (e.g. ربط)
                        if (isset($ann['linkId']) && $ann['linkId'] !== null) {
                            $inserts[] = [
                                'source_table' => $table,
                                'source_id'    => (int) $row->$primaryKey,
                                'tag_type'     => (string) $ann['type'],
                                'link_id'      => (int) $ann['linkId'],
                            ];
                        }
                    }
                }

                if (count($inserts) > 0) {
                    // Write in chunks of 1000 to keep queries small
                    foreach (array_chunk($inserts, 1000) as $chunk) {
                        DB::table('annotation_links')->insert($chunk);
                    }
                }

                $processedCount += count($rows);
                $lastId = $rows->last()->$primaryKey;
                $this->info("Processed {$processedCount} rows from {$table}. Last ID: {$lastId}.");
                gc_collect_cycles();
            }, $primaryKey);

        $this->info("Completed processing table '{$table}'. Total rows processed: {$processedCount}.\n");
    }
}
