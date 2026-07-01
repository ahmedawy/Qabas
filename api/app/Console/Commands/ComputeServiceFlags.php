<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ComputeServiceFlags extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hadith:compute-service-flags';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Compute ServiceFlags bitmask for all hadiths in booktoc_hadith';

    // Bitmask constants
    private const FLAG_JUDGMENTS   = 1;   // bit 0 — أحكام
    private const FLAG_CHAINS     = 2;   // bit 1 — أسانيد
    private const FLAG_SANAD      = 4;   // bit 2 — شجرة السند
    private const FLAG_TAKHREEG   = 8;   // bit 3 — تخريج
    private const FLAG_COMBINED   = 16;  // bit 4 — الشجرة المجمعة
    private const FLAG_COMMENTARY = 32;  // bit 5 — الشرح
    private const FLAG_THEMATIC   = 64;  // bit 6 — الموضوعات
    private const FLAG_ANALYSIS   = 128; // bit 7 — التحليل
    private const FLAG_OCCASIONS  = 256; // bit 8 — أسباب الورود
    private const FLAG_COMPOUND   = 512; // bit 9 — المتن المجمع

    public function handle(): int
    {
        $chunkSize = 10000;
        $maxId = DB::table('booktoc_hadith')->max('MainID');

        $updates = [
            [
                'name'  => 'Judgments (أحكام)',
                'flag'  => self::FLAG_JUDGMENTS,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM hadithjudgmenthits j
                                WHERE j.HadithMainID = booktoc_hadith.MainID
                            )",
            ],
            [
                'name'  => 'Chains (أسانيد + شجرة السند)',
                'flag'  => self::FLAG_CHAINS | self::FLAG_SANAD,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM asanedhadiths a
                                WHERE a.HadithMainID = booktoc_hadith.MainID
                            )",
            ],
            [
                'name'  => 'Takhreej (تخريج)',
                'flag'  => self::FLAG_TAKHREEG,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM htakhreeg t
                                WHERE t.HadithMainID = booktoc_hadith.MainID
                            )",
            ],
            [
                'name'  => 'Combined (الشجرة المجمعة)',
                'flag'  => self::FLAG_COMBINED,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM hcompoundmatn c
                                WHERE c.HadithMainID = booktoc_hadith.MainID
                            )",
            ],
            [
                'name'  => 'Commentary (الشرح)',
                'flag'  => self::FLAG_COMMENTARY,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM hadithsservices s
                                WHERE s.HadithMainID = booktoc_hadith.MainID AND s.TypeID = 6
                            )",
            ],
            [
                'name'  => 'Thematic (الموضوعات)',
                'flag'  => self::FLAG_THEMATIC,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM subjecthit sh
                                WHERE sh.ParagraphMainID = booktoc_hadith.MainID
                            )",
            ],
            [
                'name'  => 'Analysis (التحليل)',
                'flag'  => self::FLAG_ANALYSIS,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM hadithsservices s
                                WHERE s.HadithMainID = booktoc_hadith.MainID AND s.TypeID NOT IN (6, 7)
                            )",
            ],
            [
                'name'  => 'Occasions (أسباب الورود)',
                'flag'  => self::FLAG_OCCASIONS,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND EXISTS (
                                SELECT 1 FROM hadithsservices s
                                WHERE s.HadithMainID = booktoc_hadith.MainID AND s.TypeID = 7
                            )",
            ],
            [
                'name'  => 'Compound Matn (المتن المجمع)',
                'flag'  => self::FLAG_COMPOUND,
                'sql'   => "UPDATE booktoc_hadith
                            SET ServiceFlags = ServiceFlags | ?
                            WHERE MainID BETWEEN ? AND ?
                            AND (
                                EXISTS (
                                    SELECT 1 FROM htakhreeg t
                                    WHERE t.HadithMainID = booktoc_hadith.MainID
                                    AND t.CompoundMatnID > 0
                                ) OR EXISTS (
                                    SELECT 1 FROM hcompoundmatn c
                                    WHERE c.HadithMainID = booktoc_hadith.MainID
                                )
                            )",
            ],
        ];

        for ($i = 0; $i <= $maxId; $i += $chunkSize) {
            $start = $i;
            $end = $i + $chunkSize - 1;

            $this->info("Processing MainID $start to $end...");

            // First reset flags in this chunk
            DB::statement("UPDATE booktoc_hadith SET ServiceFlags = 0 WHERE MainID BETWEEN ? AND ?", [$start, $end]);

            // Then compute each flag
            foreach ($updates as $update) {
                DB::update($update['sql'], [$update['flag'], $start, $end]);
            }
        }

        $this->info('Done! ServiceFlags computed for all hadiths.');
        return Command::SUCCESS;
    }
}
