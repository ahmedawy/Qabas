<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function printTable($table) {
    echo "--- $table ---\n";
    try {
        $rows = \Illuminate\Support\Facades\DB::table($table)->limit(5)->get();
        foreach ($rows as $r) print_r((array)$r);
    } catch (\Exception $e) {}
}

printTable('hadithsservicestypes');
printTable('hadithsservices');
printTable('hadithservicesstate');
