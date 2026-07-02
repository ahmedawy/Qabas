<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = ['Author', 'BiographyScientist', 'ControversialNode', 'ExpressionNode', 'LexiconItem', 'Narrator', 'QuranVerse', 'Subject', 'IndexItem', 'Proverb', 'NarratorNameForm', 'NarratorTranslation'];
$found = [];
foreach ($tables as $t) {
    $class = 'App\Models\\' . $t;
    if (class_exists($class)) {
        try {
            $record = $class::find(4012);
            if ($record) {
                $found[$t] = $record->toArray();
            }
        } catch (\Exception $e) {}
    }
}
echo json_encode($found, JSON_UNESCAPED_UNICODE);
