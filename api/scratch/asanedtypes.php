<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$types = \Illuminate\Support\Facades\DB::table('asanedtypes')->get();
echo json_encode($types, JSON_UNESCAPED_UNICODE);
