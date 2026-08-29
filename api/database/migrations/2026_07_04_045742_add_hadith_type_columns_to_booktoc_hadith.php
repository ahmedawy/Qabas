<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $cols = [
                'is_qudsi',
                'is_marfu',
                'is_mawkof',
                'is_maktoa',
                'is_marfu_hukman',
                'is_fiiliyyah',
                'is_taqririyyah',
                'is_wasfiyyah'
            ];

            foreach ($cols as $col) {
                if (!Schema::hasColumn('booktoc_hadith', $col)) {
                    $table->boolean($col)->default(false);
                }
            }

            // Always try to add indexes if they don't exist
            // (Laravel doesn't have a direct hasIndex, so we do raw or standard Laravel indexes which MySQL will handle or we can just ignore errors)
        });

        // Let's add indexes safely using raw SQL
        $indexes = [
            'idx_hadith_qudsi' => 'is_qudsi',
            'idx_hadith_marfu' => 'is_marfu',
            'idx_hadith_mawkof' => 'is_mawkof',
            'idx_hadith_maktoa' => 'is_maktoa',
            'idx_hadith_marfu_hukman' => 'is_marfu_hukman',
            'idx_hadith_fiiliyyah' => 'is_fiiliyyah',
            'idx_hadith_taqririyyah' => 'is_taqririyyah',
            'idx_hadith_wasfiyyah' => 'is_wasfiyyah',
        ];

        foreach ($indexes as $indexName => $column) {
            try {
                // Add index using ALGORITHM=INPLACE to prevent blocking
                \Illuminate\Support\Facades\DB::statement(
                    "ALTER TABLE `booktoc_hadith` ADD INDEX `{$indexName}` (`{$column}`) ALGORITHM=INPLACE, LOCK=NONE"
                );
            } catch (\Throwable $e) {
                // Index might already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $cols = [
                'is_qudsi',
                'is_marfu',
                'is_mawkof',
                'is_maktoa',
                'is_marfu_hukman',
                'is_fiiliyyah',
                'is_taqririyyah',
                'is_wasfiyyah'
            ];

            foreach ($cols as $col) {
                if (Schema::hasColumn('booktoc_hadith', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
