<?php
declare(strict_types=1);

// Load environment variables from .env if present
if (file_exists(__DIR__ . '/../.env')) {
    foreach (file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Use Composer's autoloader if available, otherwise fall back to a minimal
// PSR-4 autoloader so the app runs even without `composer install`.
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
} else {
    spl_autoload_register(static function (string $class): void {
        $prefix = 'App\\';
        if (!str_starts_with($class, $prefix)) {
            return;
        }
        $relative = substr($class, strlen($prefix));
        $file = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    });
}

use App\Controller\RecipeController;

// CORS headers for Angular dev server
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');

// Remove base path prefix if running in subdirectory
$basePath = '/api';
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}

$controller = new RecipeController();

// Route matching
try {
    // GET /recipes
    if ($method === 'GET' && $uri === '/recipes') {
        $controller->index();
    }

    // GET /recipes/{id}/preview
    elseif ($method === 'GET' && preg_match('#^/recipes/(\d+)/preview$#', $uri, $m)) {
        $controller->preview((int) $m[1]);
    }

    // GET /recipes/{id}
    elseif ($method === 'GET' && preg_match('#^/recipes/(\d+)$#', $uri, $m)) {
        $controller->show((int) $m[1]);
    }

    // POST /recipes
    elseif ($method === 'POST' && $uri === '/recipes') {
        $controller->create();
    }

    // PUT /recipes/{id}
    elseif ($method === 'PUT' && preg_match('#^/recipes/(\d+)$#', $uri, $m)) {
        $controller->update((int) $m[1]);
    }

    // DELETE /recipes/{id}
    elseif ($method === 'DELETE' && preg_match('#^/recipes/(\d+)$#', $uri, $m)) {
        $controller->delete((int) $m[1]);
    }

    // POST /recipes/{id}/send-email
    elseif ($method === 'POST' && preg_match('#^/recipes/(\d+)/send-email$#', $uri, $m)) {
        $controller->sendEmail((int) $m[1]);
    }

    // 404
    else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Route not found', 'path' => $uri, 'method' => $method]);
    }
} catch (\JsonException $e) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid JSON in request body']);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}
