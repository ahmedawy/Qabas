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
        Schema::create('booktoc_hadith_qawliyyah', function (Blueprint $table) {
            $table->unsignedInteger('MainID')->primary();
            $table->boolean('is_qawliyyah')->default(false)->index();
            
            // Define foreign key constraint safely (optional but good practice)
            // We won't enforce strict FK if there are orphaned records, but let's keep it simple.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booktoc_hadith_qawliyyah');
    }
};
