<?php
/**
 * Generate Session-based Download Token
 * Creates a one-time use token stored in session
 */

session_start();

include_once 'dbConnection.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['formNumber']) || !isset($input['fileType'])) {
    echo json_encode(['success' => false, 'error' => 'Form number and file type are required']);
    exit;
}

$formNumber = strtoupper(trim($input['formNumber']));
$fileType = trim($input['fileType']);

// Validate form number
if (!preg_match('/^[A-Z0-9]+$/', $formNumber)) {
    echo json_encode(['success' => false, 'error' => 'Invalid form number']);
    exit;
}

// Validate file type
if (!in_array($fileType, ['admissionLetter', 'passport'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type']);
    exit;
}

// Get file name from database
$con = getConnection();
$sql = "SELECT {$fileType} as fileName FROM scholarship WHERE formNumber = ?";
$stmt = mysqli_prepare($con, $sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Database error']);
    mysqli_close($con);
    exit;
}

mysqli_stmt_bind_param($stmt, "s", $formNumber);
mysqli_stmt_execute($stmt);
$row = safe_fetch_assoc($stmt);

mysqli_stmt_close($stmt);
mysqli_close($con);

if (!$row || empty($row['fileName'])) {
    echo json_encode(['success' => false, 'error' => 'File not found']);
    exit;
}

// Generate secure random token
$token = bin2hex(random_bytes(32));

// Store token in session with file info
if (!isset($_SESSION['download_tokens'])) {
    $_SESSION['download_tokens'] = [];
}

$folder = $fileType === 'passport' ? 'passports' : 'images';

$_SESSION['download_tokens'][$token] = [
    'formNumber' => $formNumber,
    'fileType' => $fileType,
    'fileName' => $row['fileName'],
    'folder' => $folder,
    'expires' => time() + 300 // 5 minutes
];

// Return token and download URL
echo json_encode([
    'success' => true,
    'token' => $token,
    'downloadUrl' => '/server/downloadFile.php?token=' . $token
]);
