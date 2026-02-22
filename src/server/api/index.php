<?php
/**
 * Simple REST API Router
 * Routes requests to appropriate handlers based on URL path and HTTP method
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load utilities
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/../dbConnection.php';

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/asa-aswa/server/api';
$path = str_replace($basePath, '', parse_url($requestUri, PHP_URL_PATH));
$method = $_SERVER['REQUEST_METHOD'];

// Get request body for POST/PUT
$input = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput);
    if (json_last_error() !== JSON_ERROR_NONE && !empty($rawInput)) {
        Response::error('Invalid JSON in request body', 400);
    }
}

// Start session for authentication
session_start();

try {
    // Route matching
    switch (true) {
        // Auth endpoints
        case preg_match('#^/auth/login$#', $path) && $method === 'POST':
            require_once __DIR__ . '/auth.php';
            handleLogin($input);
            break;

        case preg_match('#^/auth/logout$#', $path) && $method === 'POST':
            require_once __DIR__ . '/auth.php';
            handleLogout();
            break;

        case preg_match('#^/auth/session$#', $path) && $method === 'GET':
            require_once __DIR__ . '/auth.php';
            checkSession();
            break;

        // Application endpoints
        case preg_match('#^/applications$#', $path) && $method === 'POST':
            require_once __DIR__ . '/applications.php';
            createApplication($input);
            break;

        case preg_match('#^/applications/([A-Z0-9]+)$#', $path, $matches) && $method === 'GET':
            require_once __DIR__ . '/applications.php';
            getApplication($matches[1]);
            break;

        case preg_match('#^/applications/([A-Z0-9]+)$#', $path, $matches) && $method === 'PUT':
            require_once __DIR__ . '/applications.php';
            updateApplication($matches[1], $input);
            break;

        // Admin endpoints (require authentication)
        case preg_match('#^/admin/applications$#', $path) && $method === 'GET':
            require_once __DIR__ . '/auth.php';
            require_once __DIR__ . '/admin.php';
            listApplications($_GET);
            break;

        case preg_match('#^/admin/export$#', $path) && $method === 'GET':
            require_once __DIR__ . '/auth.php';
            require_once __DIR__ . '/admin.php';
            exportApplications($_GET);
            break;

        case preg_match('#^/admin/config$#', $path) && $method === 'GET':
            require_once __DIR__ . '/auth.php';
            require_once __DIR__ . '/admin.php';
            getConfig();
            break;

        case preg_match('#^/admin/config$#', $path) && $method === 'PUT':
            require_once __DIR__ . '/auth.php';
            require_once __DIR__ . '/admin.php';
            updateConfig($input);
            break;

        // Config endpoint (public)
        case preg_match('#^/config$#', $path) && $method === 'GET':
            $config = json_decode(file_get_contents(__DIR__ . '/../config.json'), true);
            Response::success($config);
            break;

        default:
            Response::error('Endpoint not found', 404);
    }
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}
