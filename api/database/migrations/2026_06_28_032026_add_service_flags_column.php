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
            $table->integer('ServiceFlags')->default(0);
            $table->index('ServiceFlags', 'idx_booktoc_hadith_service_flags');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booktoc_hadith', function (Blueprint $table) {
            $table->dropIndex('idx_booktoc_hadith_service_flags');
            $table->dropColumn('ServiceFlags');
        });
    }
};
