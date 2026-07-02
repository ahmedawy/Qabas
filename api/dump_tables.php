<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tables = ['hadithservicesstate', 'asanedhadiths', 'asaned', 'booktoc_hadith'];
foreach ($tables as $t) {
    echo "--- $t ---\n";
    $row = \Illuminate\Support\Facades\DB::table($t)->first();
    print_r((array)$row);
}
