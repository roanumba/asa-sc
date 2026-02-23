<?php
/**
 * Secure File Serving Endpoint
 * Serves files only with valid, unexpired tokens
 */

include_once 'fileAccessToken.php';

// Add CORS headers to allow image loading
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$token = isset($_GET['token']) ? trim($_GET['token']) : '';

if (empty($token)) {
    http_response_code(400);
    die('Token is required');
}

$tokenData = validateToken($token);

if (!$tokenData) {
    http_response_code(403);
    die('Invalid, expired, or already used token');
}

$folder = $tokenData['file_type'] === 'passport' ? 'passports' : 'images';
$filePath = __DIR__ . '/' . $folder . '/' . $tokenData['file_name'];

if (!file_exists($filePath)) {
    http_response_code(404);
    error_log("File not found: " . $filePath);
    die('File not found');
}

// Don't mark token as used - allow multiple uses until expiration

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

header('Content-Type: ' . $contentType);
header('Content-Length: ' . $fileSize);
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Cache-Control: private, max-age=0, no-cache');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

readfile($filePath);
exit;
