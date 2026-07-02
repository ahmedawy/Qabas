<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tables = ['asanedtypes', 'asanedtahdethtypes', 'asanedtahdeth', 'asanedrelationstypes'];
foreach ($tables as $t) {
    echo "--- $t ---\n";
    try {
        $rows = \Illuminate\Support\Facades\DB::table($t)->limit(3)->get();
        foreach($rows as $row) print_r((array)$row);
    } catch (\Exception $e) {
        echo $e->getMessage() . "\n";
    }
}
