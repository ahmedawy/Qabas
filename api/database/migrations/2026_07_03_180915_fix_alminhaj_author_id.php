<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if Al-Nawawi exists
        $nawawiId = DB::table('authors')->where('ShortName', 'النووي')->value('ID');

        if (!$nawawiId) {
            // Insert Imam Al-Nawawi
            $nawawiId = DB::table('authors')->insertGetId([
                'Name' => 'يحيى بن شرف النووي أبو زكريا',
                'ShortName' => 'النووي',
                'DeathDate' => 676,
                'Information' => 'محيي الدين أبو زكريا يحيى بن شرف النووي الشافعي'
            ]);
        }

        // Update the AuthorID for "المنهاج في شرح صحيح مسلم بن الحجاج" (ID 35)
        DB::table('service_books')
            ->where('ID', 35)
            ->update(['AuthorID' => $nawawiId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to Imam Muslim's ID (10) for Al-Minhaj
        DB::table('service_books')
            ->where('ID', 35)
            ->update(['AuthorID' => 10]);
            
        // Note: Not removing Al-Nawawi from authors table since he is a valid author 
        // and might be referenced elsewhere in the future.
    }
};
