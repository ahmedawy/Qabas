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
        // 1. Create hadith_types lookup table
        Schema::create('hadith_types', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->string('slug', 50)->unique();
            $table->string('label', 100);
        });

        // 2. Create hadith_type_map mapping table
        Schema::create('hadith_type_map', function (Blueprint $table) {
            $table->unsignedInteger('hadith_main_id');
            $table->unsignedInteger('type_id');
            $table->unique(['hadith_main_id', 'type_id'], 'idx_main_type');
            $table->index('hadith_main_id');
            $table->index('type_id');
        });

        // 3. Seed hadith_types
        DB::table('hadith_types')->insert([
            ['id' => 1, 'slug' => 'qudsi', 'label' => 'أحاديث قدسية'],
            ['id' => 2, 'slug' => 'marfu', 'label' => 'أحاديث مرفوعة'],
            ['id' => 3, 'slug' => 'mawkof', 'label' => 'قول صحابي (موقوف)'],
            ['id' => 4, 'slug' => 'maktoa', 'label' => 'قول تابعي (مقطوع)'],
            ['id' => 5, 'slug' => 'marfu_hukman', 'label' => 'ما له حكم الرفع'],
            ['id' => 6, 'slug' => 'qawliyyah', 'label' => 'سنة قولية'],
            ['id' => 7, 'slug' => 'fiiliyyah', 'label' => 'سنة فعلية'],
            ['id' => 8, 'slug' => 'taqririyyah', 'label' => 'سنة تقريرية'],
            ['id' => 9, 'slug' => 'wasfiyyah', 'label' => 'صفات وشمائل'],
        ]);

        // 4. Drop hacky qawliyyah table
        Schema::dropIfExists('booktoc_hadith_qawliyyah');

        // We explicitly do NOT drop the boolean columns from booktoc_hadith to avoid 
        // hours of locking and table copy on the massive 2.6 GB table.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hadith_type_map');
        Schema::dropIfExists('hadith_types');
    }
};
