<?php

declare(strict_types=1);

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
        // 1. Rename existing 'book' table to 'hadith_books'
        Schema::rename('book', 'hadith_books');

        // 2. Create 'service_books' table with service-relevant columns only
        Schema::create('service_books', function (Blueprint $table) {
            $table->unsignedInteger('ID')->primary();
            $table->string('Title', 500)->default('');
            $table->text('Summary')->nullable();
            $table->unsignedInteger('AuthorID')->default(0);
            $table->unsignedInteger('MousanefID')->default(0);
            $table->unsignedInteger('Strong')->default(0);
            $table->unsignedInteger('Fame')->default(0);
            $table->unsignedInteger('Tarteeb')->default(0);
        });

        // 3. Copy rows with ID > 33 from hadith_books into service_books
        DB::statement("
            INSERT INTO service_books (ID, Title, Summary, AuthorID, MousanefID, Strong, Fame, Tarteeb)
            SELECT ID, Title, Summary, AuthorID, MousanefID, Strong, Fame, Tarteeb
            FROM hadith_books
            WHERE ID > 33
        ");

        // 4. Delete the moved rows from hadith_books
        DB::statement("DELETE FROM hadith_books WHERE ID > 33");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Move service_books back into hadith_books
        DB::statement("
            INSERT INTO hadith_books (ID, Title, Summary, AuthorID, MousanefID, Strong, Fame, Tarteeb)
            SELECT ID, Title, Summary, AuthorID, MousanefID, Strong, Fame, Tarteeb
            FROM service_books
        ");
        Schema::dropIfExists('service_books');
        Schema::rename('hadith_books', 'book');
    }
};
