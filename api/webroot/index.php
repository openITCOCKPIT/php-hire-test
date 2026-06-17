<?php
declare(strict_types=1);

/**
 * Temporary placeholder front controller.
 *
 * Its only job is to prove the development environment is wired up correctly:
 * a request reaches nginx, is handed to PHP-FPM, and PHP can open a connection
 * to the MySQL container. A single `curl http://localhost:8765` therefore
 * verifies the whole chain at once.
 *
 * This file is replaced by the real CakePHP 5 front controller in issue #2.
 */

header('Content-Type: application/json');

$database = ['connected' => false];

try {
    $pdo = new PDO(
        sprintf(
            'mysql:host=%s;port=%s;dbname=%s',
            getenv('DB_HOST') ?: 'mysql',
            getenv('DB_PORT') ?: '3306',
            getenv('DB_DATABASE') ?: ''
        ),
        getenv('DB_USERNAME') ?: '',
        getenv('DB_PASSWORD') ?: '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $database['connected'] = (bool)$pdo->query('SELECT 1')->fetchColumn();
} catch (Throwable $e) {
    $database['error'] = $e->getMessage();
}

http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'service' => 'recipe-collection-api',
    'php' => PHP_VERSION,
    'database' => $database,
    'note' => 'placeholder front controller — replaced by CakePHP in issue #2',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
