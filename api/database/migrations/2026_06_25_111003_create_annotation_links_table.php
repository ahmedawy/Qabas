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
        Schema::create('annotation_links', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('source_table', 50); // 'booktoc_hadith' or 'booktoc_services'
            $table->integer('source_id');        // MainID in source table
            $table->string('tag_type', 50);     // e.g. 'راوي', 'غريب'
            $table->integer('link_id');         // linkId / ربط value

            $table->index(['tag_type', 'link_id'], 'idx_tag_link');
            $table->index(['source_table', 'source_id'], 'idx_source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annotation_links');
    }
};
