<?php
$pdo = new PDO("mysql:host=127.0.0.1;dbname=hadithdb;charset=utf8mb4", "root", "");
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
foreach($tables as $t) {
    $cols = $pdo->query("SHOW COLUMNS FROM `$t`")->fetchAll(PDO::FETCH_COLUMN);
    foreach($cols as $c) {
        try {
            $res = $pdo->query("SELECT 1 FROM `$t` WHERE `$c` LIKE '%????%' LIMIT 1");
            if($res && $res->fetchColumn()) echo "Found in $t.$c\n";
        } catch (Exception $e) {}
    }
}
