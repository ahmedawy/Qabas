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
        // 1. Data Safety First (Backups using CREATE TABLE AS SELECT)
        DB::statement('CREATE TABLE IF NOT EXISTS booktoc_services_Backup_20260626 AS SELECT * FROM booktoc_services');
        DB::statement('CREATE TABLE IF NOT EXISTS lexiconitems_Backup_20260626 AS SELECT * FROM lexiconitems');
        DB::statement('CREATE TABLE IF NOT EXISTS hadithcontroversialtree_Backup_20260626 AS SELECT * FROM hadithcontroversialtree');
        DB::statement('CREATE TABLE IF NOT EXISTS hadithexpressionstree_Backup_20260626 AS SELECT * FROM hadithexpressionstree');
        DB::statement('CREATE TABLE IF NOT EXISTS index_Backup_20260626 AS SELECT * FROM `index`');
        DB::statement('CREATE TABLE IF NOT EXISTS nounsrelationstypes_Backup_20260626 AS SELECT * FROM nounsrelationstypes');

        // 2. Schema Cleanup and Indexing
        Schema::table('booktoc_services', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_booktoc_services_parent_id');
        });

        Schema::table('lexiconitems', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_lexiconitems_parent_id');
        });

        Schema::table('hadithcontroversialtree', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_controversial_parent_id');
        });

        Schema::table('hadithexpressionstree', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_expression_parent_id');
        });

        Schema::table('index', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_index_parent_id');
        });

        Schema::table('nounsrelationstypes', function (Blueprint $table) {
            $table->dropColumn(['LeftValue', 'RightValue']);
            $table->index('ParentID', 'idx_nouns_relations_parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Re-add LeftValue and RightValue columns
        Schema::table('booktoc_services', function (Blueprint $table) {
            $table->dropIndex('idx_booktoc_services_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('lexiconitems', function (Blueprint $table) {
            $table->dropIndex('idx_lexiconitems_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('hadithcontroversialtree', function (Blueprint $table) {
            $table->dropIndex('idx_controversial_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('hadithexpressionstree', function (Blueprint $table) {
            $table->dropIndex('idx_expression_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('index', function (Blueprint $table) {
            $table->dropIndex('idx_index_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        Schema::table('nounsrelationstypes', function (Blueprint $table) {
            $table->dropIndex('idx_nouns_relations_parent_id');
            $table->integer('LeftValue')->nullable();
            $table->integer('RightValue')->nullable();
        });

        // 2. Restore values from backups
        DB::statement('UPDATE booktoc_services t INNER JOIN booktoc_services_Backup_20260626 bk ON t.MainID = bk.MainID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');
        DB::statement('UPDATE lexiconitems t INNER JOIN lexiconitems_Backup_20260626 bk ON t.ID = bk.ID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');
        DB::statement('UPDATE hadithcontroversialtree t INNER JOIN hadithcontroversialtree_Backup_20260626 bk ON t.ID = bk.ID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');
        DB::statement('UPDATE hadithexpressionstree t INNER JOIN hadithexpressionstree_Backup_20260626 bk ON t.ID = bk.ID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');
        DB::statement('UPDATE `index` t INNER JOIN index_Backup_20260626 bk ON t.ID = bk.ID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');
        DB::statement('UPDATE nounsrelationstypes t INNER JOIN nounsrelationstypes_Backup_20260626 bk ON t.ID = bk.ID SET t.LeftValue = bk.LeftValue, t.RightValue = bk.RightValue');

        // 3. Drop backups
        DB::statement('DROP TABLE IF EXISTS booktoc_services_Backup_20260626');
        DB::statement('DROP TABLE IF EXISTS lexiconitems_Backup_20260626');
        DB::statement('DROP TABLE IF EXISTS hadithcontroversialtree_Backup_20260626');
        DB::statement('DROP TABLE IF EXISTS hadithexpressionstree_Backup_20260626');
        DB::statement('DROP TABLE IF EXISTS index_Backup_20260626');
        DB::statement('DROP TABLE IF EXISTS nounsrelationstypes_Backup_20260626');
    }
};
