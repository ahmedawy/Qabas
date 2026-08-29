<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PopulateHadithTypes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hadith:populate-types {--chunk=5000 : Chunk size for processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate the normalized Many-to-Many hadith type relationships from Annotations column in booktoc_hadith.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');
        
        $this->info("Fetching hadith types lookup map...");
        $typeMap = DB::table('hadith_types')->pluck('id', 'slug')->toArray();
        if (empty($typeMap)) {
            $this->error("No types found in hadith_types. Please make sure the migrations were run.");
            return 1;
        }

        $this->info("Truncating hadith_type_map table...");
        DB::table('hadith_type_map')->truncate();

        $this->info("Counting rows with annotations...");
        $totalRows = DB::table('booktoc_hadith')
            ->whereNotNull('Annotations')
            ->where(DB::raw('LENGTH(Annotations)'), '>', 2)
            ->count();

        if ($totalRows === 0) {
            $this->info("No rows with annotations found.");
            return 0;
        }

        $this->info("Found {$totalRows} rows to process. Starting...");
        $bar = $this->output->createProgressBar($totalRows);
        $bar->start();

        DB::table('booktoc_hadith')
            ->select('MainID', 'Annotations')
            ->whereNotNull('Annotations')
            ->where(DB::raw('LENGTH(Annotations)'), '>', 2)
            ->orderBy('MainID')
            ->chunkById($chunkSize, function ($rows) use ($bar, $typeMap) {
                DB::beginTransaction();
                try {
                    $inserts = [];
                    foreach ($rows as $row) {
                        $annotations = json_decode($row->Annotations, true);
                        if (!is_array($annotations)) {
                            continue;
                        }

                        $slugs = [];

                        foreach ($annotations as $item) {
                            $type = $item['type'] ?? '';
                            if ($type === 'حديث' || $type === 'متن') {
                                $attrs = $item['attrs'] ?? [];
                                
                                if (isset($attrs['نوع'])) {
                                    $val = $attrs['نوع'];
                                    if ($val === 'قدسي') {
                                        $slugs[] = 'qudsi';
                                    } elseif ($val === 'مرفوع') {
                                        $slugs[] = 'marfu';
                                    } elseif ($val === 'موقوف') {
                                        $slugs[] = 'mawkof';
                                    } elseif ($val === 'مقطوع') {
                                        $slugs[] = 'maktoa';
                                    } elseif ($val === 'مرفوع_حكما' || $val === 'له_حكم_الرفع') {
                                        $slugs[] = 'marfu_hukman';
                                    }
                                }

                                if (isset($attrs['تخصيص'])) {
                                    $val = $attrs['تخصيص'];
                                    if ($val === 'فعلية') {
                                        $slugs[] = 'fiiliyyah';
                                    } elseif ($val === 'تقريرية') {
                                        $slugs[] = 'taqririyyah';
                                    } elseif ($val === 'وصفية') {
                                        $slugs[] = 'wasfiyyah';
                                    } elseif ($val === 'قولية') {
                                        $slugs[] = 'qawliyyah';
                                    }
                                }
                            }
                        }

                        $slugs = array_unique($slugs);

                        foreach ($slugs as $slug) {
                            if (isset($typeMap[$slug])) {
                                $inserts[] = [
                                    'hadith_main_id' => $row->MainID,
                                    'type_id' => $typeMap[$slug],
                                ];
                            }
                        }
                    }

                    if (count($inserts) > 0) {
                        DB::table('hadith_type_map')->insertOrIgnore($inserts);
                    }
                    
                    DB::commit();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    $this->error("\nError in chunk: " . $e->getMessage());
                    throw $e;
                }

                $bar->advance(count($rows));
                gc_collect_cycles();
            }, 'MainID');

        $bar->finish();
        $this->info("\nDone!");
        return 0;
    }
}
