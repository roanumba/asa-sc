<?php
/**
 * File Module
 * Handles upload, token generation, inline view, and download
 * Replaces: fileUpload.php, fileAccessToken.php, generateDownloadToken.php,
 *           serveFile.php, viewFile.php, downloadFile.php
 */

require_once __DIR__ . '/utils/FileToken.php';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'pdf'];
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const CONTENT_TYPES = [
    'pdf'  => 'application/pdf',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
];
const UPLOAD_DIRS = [
    'passport'       => 'passports',
    'admissionLetter' => 'images',
];

function resolveFilePath(string $fileType, string $fileName): string {
    $dir = UPLOAD_DIRS[$fileType] ?? null;
    if (!$dir) return '';
    return __DIR__ . '/../' . $dir . '/' . $fileName;
}

function serveFile(string $filePath, string $disposition = 'inline'): void {
    if (!file_exists($filePath)) {
        http_response_code(404);
        Response::error('File not found', 404);
    }
    $ext         = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $contentType = CONTENT_TYPES[$ext] ?? 'application/octet-stream';
    ob_end_clean();
    header('Content-Type: '        . $contentType);
    header('Content-Length: '      . filesize($filePath));
    header('Content-Disposition: ' . $disposition . '; filename="' . basename($filePath) . '"');
    header('X-Content-Type-Options: nosniff');
    if ($disposition === 'inline') {
        header('Cache-Control: private, max-age=300');
    } else {
        header('Cache-Control: private, no-cache, no-store, must-revalidate');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'HEAD') {
        exit;
    }
    readfile($filePath);
    exit;
}

function getFileNameFromDb(string $formNumber, string $fileType): string|false {
    $allowed = array_keys(UPLOAD_DIRS);
    if (!in_array($fileType, $allowed, true)) return false;
    $con  = getConnection();
    $stmt = mysqli_prepare($con, "SELECT {$fileType} AS fn FROM scholarship WHERE formNumber = ?");
    mysqli_stmt_bind_param($stmt, "s", $formNumber);
    mysqli_stmt_execute($stmt);
    $row = safe_fetch_assoc($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    return (!empty($row['fn'])) ? $row['fn'] : false;
}

function saveUploadedFile(string $tmpPath, string $formNumber, string $uploadType): array {
    $xplod   = explode('.', $_FILES['image']['name']);
    $fileExt = strtolower(end($xplod));
    $origName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];

    if (!in_array($fileExt, ALLOWED_EXTENSIONS)) {
        return ['error' => true, 'message' => 'File type not allowed. Please choose a PDF, JPEG or PNG file.'];
    }
    if ($fileSize > 2097152) {
        return ['error' => true, 'message' => 'File size must be less than 2 MB'];
    }

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $tmpPath);
    finfo_close($finfo);
    if (!in_array($mimeType, ALLOWED_MIMES)) {
        return ['error' => true, 'message' => 'Invalid file content.'];
    }
    if (in_array($fileExt, ['jpeg','jpg','png']) && @getimagesize($tmpPath) === false) {
        return ['error' => true, 'message' => 'Invalid image file.'];
    }

    $fileType = ($uploadType === 'passport') ? 'passport' : 'admissionLetter';
    $dir      = UPLOAD_DIRS[$fileType];
    $basePath = __DIR__ . '/../' . $dir . '/';

    // Clean up old files for this form
    foreach (glob($basePath . $formNumber . '_*') ?: [] as $old) {
        @unlink($old);
    }
    if (!is_dir($basePath)) mkdir($basePath, 0755, true);

    $nameWithoutExt = pathinfo($origName, PATHINFO_FILENAME);
    $cleanName      = substr(preg_replace('/[^a-zA-Z0-9_-]/', '', $nameWithoutExt), 0, 10) ?: 'file';
    $savedFileName  = $formNumber . '_' . $cleanName . '.' . $fileExt;
    $destPath       = $basePath . $savedFileName;

    if (!move_uploaded_file($tmpPath, $destPath)) {
        return ['error' => true, 'message' => 'Error saving file to server'];
    }

    $con  = getConnection();
    $stmt = mysqli_prepare($con, "UPDATE scholarship SET {$fileType} = ? WHERE formNumber = ?");
    mysqli_stmt_bind_param($stmt, "ss", $savedFileName, $formNumber);
    $ok = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($con);

    if (!$ok) {
        @unlink($destPath);
        return ['error' => true, 'message' => 'Error updating database'];
    }

    return ['error' => false, 'message' => ucfirst($uploadType) . ' uploaded successfully'];
}

// ─── Route Handlers ─────────────────────────────────────────────────────────

/**
 * POST /api/files/upload
 * Multipart form: image (file), formNumber, uploadType (passport|admissionLetter)
 */
function handleFileUpload(): void {
    if (!isset($_FILES['image'])) {
        Response::error('No file provided', 400);
    }
    $formNumber = strtoupper(trim(filter_input(INPUT_POST, 'formNumber', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? ''));
    $uploadType = trim(filter_input(INPUT_POST, 'uploadType', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');

    if (!preg_match('/^[A-Z0-9]+$/', $formNumber)) {
        Response::error('Invalid form number', 400);
    }
    $result = saveUploadedFile($_FILES['image']['tmp_name'], $formNumber, $uploadType);
    if ($result['error']) {
        Response::error($result['message'], 422);
    }
    Response::success(null, $result['message']);
}

/**
 * POST /api/files/token
 * Body: { formNumber, fileType }
 * Returns a short-lived token to view/download the file
 */
function handleCreateToken(): void {
    global $input;
    $formNumber = strtoupper(trim($input->formNumber ?? ''));
    $fileType   = trim($input->fileType ?? '');

    if (!preg_match('/^[A-Z0-9]+$/', $formNumber) || !array_key_exists($fileType, UPLOAD_DIRS)) {
        Response::error('Invalid form number or file type', 400);
    }
    $fileName = getFileNameFromDb($formNumber, $fileType);
    if (!$fileName) {
        Response::error('File not found', 404);
    }
    $token = createFileToken($formNumber, $fileType, $fileName);
    if (!$token) {
        Response::error('Could not generate token', 500);
    }
    if (rand(1, 10) === 1) pruneExpiredTokens();
    Response::success(['token' => $token, 'expiresIn' => 300]);
}

/**
 * GET /api/files/view?form=FORMNO&type=fileType
 * Inline file serve — no token required (thumbnail use)
 */
function handleViewFile(): void {
    $formNumber = strtoupper(trim($_GET['form'] ?? ''));
    $fileType   = trim($_GET['type'] ?? '');

    if (!preg_match('/^[A-Z0-9]+$/', $formNumber) || !array_key_exists($fileType, UPLOAD_DIRS)) {
        Response::error('Invalid parameters', 400);
    }
    $fileName = getFileNameFromDb($formNumber, $fileType);
    if (!$fileName) Response::error('File not found', 404);

    serveFile(resolveFilePath($fileType, $fileName), 'inline');
}

/**
 * GET /api/files/download?token=TOKEN
 * Token-gated file serve (inline or attachment based on file type)
 */
function handleDownloadFile(): void {
    $token = trim($_GET['token'] ?? '');
    if (!$token) Response::error('Token required', 400);

    $data = validateFileToken($token);
    if (!$data) Response::error('Invalid or expired token', 403);

    $filePath = resolveFilePath($data['file_type'], $data['file_name']);
    serveFile($filePath, 'inline');
}
