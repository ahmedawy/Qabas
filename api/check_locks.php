<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Locks:" . PHP_EOL;
try {
    $locks = DB::select("SELECT * FROM information_schema.INNODB_LOCKS");
    print_r($locks);
} catch (\Exception $e) {
    echo "Locks error: " . $e->getMessage() . PHP_EOL;
}

echo "Lock Waits:" . PHP_EOL;
try {
    $waits = DB::select("SELECT * FROM information_schema.INNODB_LOCK_WAITS");
    print_r($waits);
} catch (\Exception $e) {
    echo "Waits error: " . $e->getMessage() . PHP_EOL;
}

echo "Active Transactions:" . PHP_EOL;
try {
    $trx = DB::select("SELECT * FROM information_schema.INNODB_TRX");
    print_r($trx);
} catch (\Exception $e) {
    echo "Trx error: " . $e->getMessage() . PHP_EOL;
}
