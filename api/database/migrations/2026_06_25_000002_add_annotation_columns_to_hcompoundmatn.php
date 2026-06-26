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
        $backupTableName = 'hcompoundmatn_Backup_20260625';
        if (!Schema::hasTable($backupTableName)) {
            DB::statement("CREATE TABLE {$backupTableName} LIKE hcompoundmatn");
            DB::statement("INSERT INTO {$backupTableName} SELECT * FROM hcompoundmatn");
        }

        // 2. Add columns to hcompoundmatn
        Schema::table('hcompoundmatn', function (Blueprint $table) {
            $table->mediumText('CleanMatn')->nullable()->after('Matn');
            $table->json('MatnAnnotations')->nullable()->after('CleanMatn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hcompoundmatn', function (Blueprint $table) {
            $table->dropColumn(['CleanMatn', 'MatnAnnotations']);
        });
    }
};
