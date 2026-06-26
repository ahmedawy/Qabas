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
        // 1. Data Safety First (Backups using optimized CREATE TABLE AS SELECT)
        DB::statement('CREATE TABLE booktoc_hadith_Backup_20260625_v2 AS SELECT * FROM booktoc_hadith');
        DB::statement('CREATE TABLE subject_Backup_20260625_v2 AS SELECT * FROM subject');

        // 2. Schema Cleanup and Indexing
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_booktoc_hadith_parent_id');
        });

        Schema::table('subject', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_subject_parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add LeftValue and RightValue columns
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $table->dropIndex('idx_booktoc_hadith_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('subject', function (Blueprint $table) {
            $table->dropIndex('idx_subject_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        // 2. Restore values from backups
        DB::statement('UPDATE booktoc_hadith b INNER JOIN booktoc_hadith_Backup_20260625_v2 bk ON b.MainID = bk.MainID SET b.LeftValue = bk.LeftValue, b.RightValue = bk.RightValue');
        DB::statement('UPDATE subject s INNER JOIN subject_Backup_20260625_v2 bk ON s.ID = bk.ID SET s.LeftValue = bk.LeftValue, s.RightValue = bk.RightValue');

        // 3. Drop backups
        DB::statement('DROP TABLE IF EXISTS booktoc_hadith_Backup_20260625_v2');
        DB::statement('DROP TABLE IF EXISTS subject_Backup_20260625_v2');
    }
};

