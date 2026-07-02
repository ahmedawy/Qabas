<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function printSchema($table) {
    echo "--- $table ---\n";
    $cols = \Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM $table");
    foreach ($cols as $c) {
        echo $c->Field . " (" . $c->Type . ")\n";
    }
}

printSchema('booktoc_hadith');
printSchema('asanedhadiths');
printSchema('hadithjudgmenthits');
printSchema('hadithjudgmentsays');
