<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateAnnotations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hadith:migrate-annotations
                            {--table=booktoc_hadith : Target table name}
                            {--content-column=Content : Source column with XML}
                            {--primary-key=MainID : Primary key of the target table}
                            {--chunk=1000 : Rows per batch}
                            {--dry-run : Parse and display stats without writing to DB}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract proprietary XML tags from booktoc_hadith, booktoc_services, or hcompoundmatn content into Clean and Annotations columns.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $table = (string) $this->option('table');
        $contentCol = (string) $this->option('content-column');
        $primaryKey = (string) $this->option('primary-key');
        $chunkSize = (int) $this->option('chunk');
        $dryRun = (bool) $this->option('dry-run');

        // Determine destination columns based on input column name
        if ($contentCol === 'Matn') {
            $cleanCol = 'CleanMatn';
            $annotationCol = 'MatnAnnotations';
        } else {
            $cleanCol = 'CleanContent';
            $annotationCol = 'Annotations';
        }

        if ($dryRun) {
            $this->info("Running in DRY-RUN mode. No changes will be written to the database.");
        }

        // Check if the table and columns exist
        if (!Schema::hasTable($table)) {
            $this->error("Table {$table} does not exist.");
            return 1;
        }

        if (!Schema::hasColumn($table, $cleanCol) || !Schema::hasColumn($table, $annotationCol)) {
            $this->error("Target columns {$cleanCol} or {$annotationCol} do not exist. Please run migrations first.");
            return 1;
        }

        // Get total count of rows to process
        $query = DB::table($table)
            ->whereNotNull($contentCol)
            ->whereNull($cleanCol);

        $totalRows = $query->count();

        if ($totalRows === 0) {
            $this->info('All rows have already been processed.');
            return 0;
        }

        $this->info("Found {$totalRows} rows to process in table '{$table}'.");
        $bar = $this->output->createProgressBar($totalRows);
        $bar->start();

        $processedCount = 0;
        $errorCount = 0;

        DB::table($table)
            ->select($primaryKey, $contentCol)
            ->whereNotNull($contentCol)
            ->whereNull($cleanCol)
            ->orderBy($primaryKey)
            ->chunkById($chunkSize, function ($rows) use ($table, $contentCol, $cleanCol, $annotationCol, $primaryKey, $dryRun, $bar, &$processedCount, &$errorCount) {
                if (!$dryRun) {
                    DB::beginTransaction();
                }

                try {
                    foreach ($rows as $row) {
                        $parsed = $this->parseXml($row->$contentCol);

                        if (!$dryRun) {
                            DB::table($table)
                                ->where($primaryKey, $row->$primaryKey)
                                ->update([
                                    $cleanCol => $parsed['cleanContent'],
                                    $annotationCol => json_encode($parsed['annotations'], JSON_UNESCAPED_UNICODE),
                                ]);
                        }

                        $processedCount++;
                    }

                    if (!$dryRun) {
                        DB::commit();
                    }
                } catch (\Throwable $e) {
                    if (!$dryRun) {
                        DB::rollBack();
                    }
                    $this->error("\nError processing batch: " . $e->getMessage());
                    $errorCount += count($rows);
                }

                $bar->advance(count($rows));
                gc_collect_cycles();
            }, $primaryKey);

        $bar->finish();
        $this->info("\nProcessing completed. Success: {$processedCount}, Errors/Skipped: {$errorCount}.");

        return $errorCount === 0 ? 0 : 1;
    }

    /**
     * Parse XML tags and build CleanContent and Annotations array.
     *
     * @param string $content
     * @return array{cleanContent: string, annotations: array}
     */
    private function parseXml(string $content): array
    {
        $len = mb_strlen($content, 'UTF-8');
        $cleanContent = '';
        $annotations = [];
        $stack = [];
        $annotationCounter = 0;

        $i = 0;
        while ($i < $len) {
            $char = mb_substr($content, $i, 1, 'UTF-8');
            if ($char === '<') {
                $nextClose = mb_strpos($content, '>', $i, 'UTF-8');
                if ($nextClose !== false) {
                    $tagOuter = mb_substr($content, $i, $nextClose - $i + 1, 'UTF-8');
                    
                    if (mb_substr($tagOuter, 1, 1, 'UTF-8') === '/') {
                        // Closing tag: </tagname>
                        $tagName = trim(mb_substr($tagOuter, 2, mb_strlen($tagOuter, 'UTF-8') - 3, 'UTF-8'));
                        
                        $foundKey = null;
                        for ($j = count($stack) - 1; $j >= 0; $j--) {
                            if ($stack[$j]['type'] === $tagName) {
                                $foundKey = $j;
                                break;
                            }
                        }
                        
                        if ($foundKey !== null) {
                            $openTagInfo = $stack[$foundKey];
                            array_splice($stack, $foundKey, 1);
                            
                            $startPos = $openTagInfo['start'];
                            $length = mb_strlen($cleanContent, 'UTF-8') - $startPos;
                            
                            $annotations[] = [
                                'type' => $openTagInfo['type'],
                                'start' => $startPos,
                                'length' => $length,
                                'linkId' => $openTagInfo['linkId'],
                                'parentIndex' => null,
                                'attrs' => $openTagInfo['attrs'],
                                '_temp_id' => $openTagInfo['temp_id'],
                                '_parent_temp_id' => $openTagInfo['_parent_temp_id']
                            ];
                        }
                    } else {
                        // Opening or self-closing tag
                        $isSelfClosing = (mb_substr($tagOuter, -2, 1, 'UTF-8') === '/');
                        $tagInner = mb_substr($tagOuter, 1, mb_strlen($tagOuter, 'UTF-8') - ($isSelfClosing ? 3 : 2), 'UTF-8');
                        
                        $parts = preg_split('/\s+/', trim($tagInner), 2);
                        $tagName = $parts[0];
                        $attrsString = isset($parts[1]) ? $parts[1] : '';
                        
                        $attrs = null;
                        $linkId = null;
                        if ($attrsString !== '') {
                            preg_match_all('/([^\s=]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+))/u', $attrsString, $matches, PREG_SET_ORDER);
                            foreach ($matches as $match) {
                                $attrName = $match[1];
                                $attrVal = $match[2] ?? $match[3] ?? $match[4] ?? '';
                                if ($attrName === 'ربط') {
                                    $linkId = is_numeric($attrVal) ? (int)$attrVal : null;
                                } else {
                                    if ($attrs === null) {
                                        $attrs = [];
                                    }
                                    $attrs[$attrName] = $attrVal;
                                }
                            }
                        }
                        
                        $parentTempId = !empty($stack) ? $stack[count($stack) - 1]['temp_id'] : null;
                        $tempId = $annotationCounter++;
                        
                        if ($isSelfClosing) {
                            $annotations[] = [
                                'type' => $tagName,
                                'start' => mb_strlen($cleanContent, 'UTF-8'),
                                'length' => 0,
                                'linkId' => $linkId,
                                'parentIndex' => null,
                                'attrs' => $attrs,
                                '_temp_id' => $tempId,
                                '_parent_temp_id' => $parentTempId
                            ];
                        } else {
                            $stack[] = [
                                'type' => $tagName,
                                'start' => mb_strlen($cleanContent, 'UTF-8'),
                                'linkId' => $linkId,
                                'parentIndex' => null,
                                'attrs' => $attrs,
                                'temp_id' => $tempId,
                                '_parent_temp_id' => $parentTempId
                            ];
                        }
                    }
                    $i = $nextClose + 1;
                    continue;
                }
            }
            $cleanContent .= $char;
            $i++;
        }

        // Flush any unclosed tags
        while (!empty($stack)) {
            $openTagInfo = array_pop($stack);
            $startPos = $openTagInfo['start'];
            $length = mb_strlen($cleanContent, 'UTF-8') - $startPos;
            $annotations[] = [
                'type' => $openTagInfo['type'],
                'start' => $startPos,
                'length' => $length,
                'linkId' => $openTagInfo['linkId'],
                'parentIndex' => null,
                'attrs' => $openTagInfo['attrs'],
                '_temp_id' => $openTagInfo['temp_id'],
                '_parent_temp_id' => $openTagInfo['_parent_temp_id'] ?? null
            ];
        }

        // Sort annotations to establish correct nesting indices
        usort($annotations, function ($a, $b) {
            if ($a['start'] !== $b['start']) {
                return $a['start'] <=> $b['start'];
            }
            if ($a['length'] !== $b['length']) {
                return $b['length'] <=> $a['length'];
            }
            return $a['_temp_id'] <=> $b['_temp_id'];
        });

        // Map temp_id to sorted array indices
        $tempIdToSortedIndex = [];
        foreach ($annotations as $idx => $ann) {
            $tempIdToSortedIndex[$ann['_temp_id']] = $idx;
        }

        // Populate parentIndex
        for ($idx = 0; $idx < count($annotations); $idx++) {
            $parentTempId = $annotations[$idx]['_parent_temp_id'] ?? null;
            if ($parentTempId !== null && isset($tempIdToSortedIndex[$parentTempId])) {
                $annotations[$idx]['parentIndex'] = $tempIdToSortedIndex[$parentTempId];
            } else {
                $annotations[$idx]['parentIndex'] = null;
            }
            
            unset($annotations[$idx]['_temp_id']);
            unset($annotations[$idx]['_parent_temp_id']);
        }

        return [
            'cleanContent' => $cleanContent,
            'annotations' => $annotations,
        ];
    }
}
