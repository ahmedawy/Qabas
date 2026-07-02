<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$groupId = 96431;

$members = DB::table('htakhreeg')->where('GroupID', $groupId)->pluck('HadithMainID')->toArray();

echo "Total members in Group {$groupId}: " . count($members) . "\n\n";

$companionCounts = [];
foreach ($members as $mid) {
    $asaned = DB::table('asanedhadiths as ah')
        ->join('asaned as a', 'ah.SanadID', '=', 'a.ID')
        ->where('ah.HadithMainID', $mid)
        ->pluck('a.SandRwah')
        ->toArray();
        
    $companionNames = [];
    foreach ($asaned as $chain) {
        $narrators = explode(' ', trim($chain));
        $firstId = null;
        foreach ($narrators as $n) {
            if (!empty($n)) {
                $firstId = (int)$n;
                break;
            }
        }
        if ($firstId) {
            $name = DB::table('nouns')->where('ID', $firstId)->value('Name');
            $companionNames[] = $name;
        }
    }
    
    $companionNames = array_unique($companionNames);
    $compsStr = implode(' | ', $companionNames);
    
    if (empty($compsStr)) {
        $compsStr = 'No Companion Found';
    }
    
    if (!isset($companionCounts[$compsStr])) {
        $companionCounts[$compsStr] = [];
    }
    $companionCounts[$compsStr][] = $mid;
}

foreach ($companionCounts as $comp => $ids) {
    echo "Companion: \"{$comp}\" | Count: " . count($ids) . " | IDs: " . implode(', ', $ids) . "\n";
}
