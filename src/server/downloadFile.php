<?php
/**
 * Secure File Download with Session-based One-Time Token
 * Token is generated and used within the same session
 */

session_start();

// Start output buffering to catch any stray output
ob_start();

include_once 'dbConnection.php';

// Add CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get token from query parameter
$token = isset($_GET['token']) ? trim($_GET['token']) : '';

if (empty($token)) {
    http_response_code(400);
    die('Token is required');
}

// Validate token from session
if (!isset($_SESSION['download_tokens'][$token])) {
    http_response_code(403);
    die('Invalid or expired token');
}

// Get file info from session
$fileInfo = $_SESSION['download_tokens'][$token];

// Delete token immediately after use (one-time use)
unset($_SESSION['download_tokens'][$token]);

// Clean up expired tokens (older than 5 minutes)
if (isset($_SESSION['download_tokens'])) {
    $now = time();
    foreach ($_SESSION['download_tokens'] as $key => $info) {
        if (isset($info['expires']) && $info['expires'] < $now) {
            unset($_SESSION['download_tokens'][$key]);
        }
    }
}

// Verify file exists
$filePath = __DIR__ . '/' . $fileInfo['folder'] . '/' . $fileInfo['fileName'];

if (!file_exists($filePath)) {
    http_response_code(404);
    error_log("File not found: " . $filePath);
    die('File not found');
}

// Get file info
$fileSize = filesize($filePath);
$fileExt = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

$contentTypes = [
    'pdf' => 'application/pdf',
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif'
];

$contentType = isset($contentTypes[$fileExt]) ? $contentTypes[$fileExt] : 'application/octet-stream';

// Clear any buffered output before sending file
ob_end_clean();

// Serve the file
header('Content-Type: ' . $contentType);
header('Content-Length: ' . $fileSize);
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Cache-Control: private, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');

readfile($filePath);
exit;
