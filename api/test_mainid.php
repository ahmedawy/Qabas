<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$node = \App\Models\BookTocHadith::first();
echo "MainID: " . $node->MainID . "\n";
echo "Attributes:\n";
print_r($node->getAttributes());
