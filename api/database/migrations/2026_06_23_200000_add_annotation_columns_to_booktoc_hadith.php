<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create backup table
        $backupTableName = 'booktoc_hadith_Backup_20260623';
        if (!Schema::hasTable($backupTableName)) {
            DB::statement("CREATE TABLE {$backupTableName} LIKE booktoc_hadith");
            DB::statement("INSERT INTO {$backupTableName} SELECT * FROM booktoc_hadith");
        }

        // 2. Add columns to booktoc_hadith
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $table->mediumText('CleanContent')->nullable()->after('Content');
            $table->json('Annotations')->nullable()->after('CleanContent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $table->dropColumn(['CleanContent', 'Annotations']);
        });
        
        // Note: We deliberately do NOT drop the backup table for data safety.
    }
};
