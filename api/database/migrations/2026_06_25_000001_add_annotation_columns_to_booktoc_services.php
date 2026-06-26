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
        $backupTableName = 'booktoc_services_Backup_20260625';
        if (!Schema::hasTable($backupTableName)) {
            DB::statement("CREATE TABLE {$backupTableName} LIKE booktoc_services");
            DB::statement("INSERT INTO {$backupTableName} SELECT * FROM booktoc_services");
        }

        // 2. Add columns to booktoc_services
        Schema::table('booktoc_services', function (Blueprint $table) {
            $table->mediumText('CleanContent')->nullable()->after('Content');
            $table->json('Annotations')->nullable()->after('CleanContent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booktoc_services', function (Blueprint $table) {
            $table->dropColumn(['CleanContent', 'Annotations']);
        });
    }
};
