<?php
/**
 * Simple File Viewer for Thumbnails
 * No token required - just verifies the file belongs to the form
 */

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

// Get parameters
$formNumber = isset($_GET['form']) ? strtoupper(trim($_GET['form'])) : '';
$fileType = isset($_GET['type']) ? trim($_GET['type']) : '';

if (empty($formNumber) || empty($fileType)) {
    http_response_code(400);
    die('Form number and file type are required');
}

// Validate form number format
if (!preg_match('/^[A-Z0-9]+$/', $formNumber)) {
    http_response_code(400);
    die('Invalid form number');
}

// Validate file type
if (!in_array($fileType, ['admissionLetter', 'passport'])) {
    http_response_code(400);
    die('Invalid file type');
}

// Get file name from database
$con = getConnection();
$sql = "SELECT {$fileType} as fileName FROM scholarship WHERE formNumber = ?";
$stmt = mysqli_prepare($con, $sql);

if (!$stmt) {
    http_response_code(500);
    die('Database error');
}

mysqli_stmt_bind_param($stmt, "s", $formNumber);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);

mysqli_stmt_close($stmt);
mysqli_close($con);

if (!$row || empty($row['fileName'])) {
    http_response_code(404);
    die('File not found');
}

$fileName = $row['fileName'];
$folder = $fileType === 'passport' ? 'passports' : 'images';
$filePath = __DIR__ . '/' . $folder . '/' . $fileName;

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
header('Cache-Control: private, max-age=300'); // 5 minute cache
header('X-Content-Type-Options: nosniff');

readfile($filePath);
exit;
