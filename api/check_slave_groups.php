<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$bookId = 1; // Bukhari
$hadithId = 5;

// Master GroupID
$masterGroup = DB::table('htakhreeg')->where('HadithMainID', $hadithId)->value('GroupID');
echo "Master GroupID: $masterGroup\n\n";

$shawahedIds = DB::table("hmatncomparison{$bookId}")
    ->where('MasterMatnID', $hadithId)
    ->pluck('SlaveMatnID')
    ->toArray();

$inGroup = 0;
$outGroup = 0;
$outGroupDetails = [];

foreach ($shawahedIds as $id) {
    $row = DB::table('htakhreeg')->where('HadithMainID', $id)->first();
    if (!$row) {
        echo "SlaveID $id has no entry in htakhreeg!\n";
        continue;
    }
    
    if ($row->GroupID == $masterGroup) {
        $inGroup++;
    } else {
        $outGroup++;
        $outGroupDetails[] = [
            'id' => $id,
            'group_id' => $row->GroupID,
            'book' => DB::table('booktoc_hadith')->where('MainID', $id)->value('BookName'),
            'tarqeem' => DB::table('booktoc_hadith')->where('MainID', $id)->value('TarqeemMatboa1'),
        ];
    }
}

echo "Total slaves compared: " . count($shawahedIds) . "\n";
echo "Number of slaves IN the master's takhreej group: $inGroup\n";
echo "Number of slaves OUTSIDE the master's takhreej group: $outGroup\n";

if ($outGroup > 0) {
    echo "\nDetails of slaves outside group:\n";
    print_r($outGroupDetails);
}
