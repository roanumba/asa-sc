<?php
/**
 * File Access Token Manager
 * Generates secure, short-lived tokens for accessing uploaded files
 */

include_once 'dbConnection.php';

function ensureTokenTableExists() {
    $con = getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS file_access_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        form_number VARCHAR(20) NOT NULL,
        file_type ENUM('admissionLetter', 'passport') NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        INDEX idx_token (token),
        INDEX idx_expires (expires_at),
        INDEX idx_form (form_number)
    )";

    mysqli_query($con, $sql);
    mysqli_close($con);
}

function generateSecureToken() {
    return bin2hex(random_bytes(32));
}

function createFileAccessToken($formNumber, $fileType, $fileName, $expiryMinutes = 5) {
    ensureTokenTableExists();

    $con = getConnection();
    $token = generateSecureToken();
    $expiresAt = date('Y-m-d H:i:s', time() + ($expiryMinutes * 60));

    $sql = "INSERT INTO file_access_tokens (token, form_number, file_type, file_name, expires_at)
            VALUES (?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($con, $sql);

    if (!$stmt) {
        error_log("Failed to prepare token creation statement: " . mysqli_error($con));
        mysqli_close($con);
        return false;
    }

    mysqli_stmt_bind_param($stmt, "sssss", $token, $formNumber, $fileType, $fileName, $expiresAt);
    $result = mysqli_stmt_execute($stmt);

    mysqli_stmt_close($stmt);
    mysqli_close($con);

    return $result ? $token : false;
}

function validateToken($token) {
    ensureTokenTableExists();

    $con = getConnection();

    $sql = "SELECT * FROM file_access_tokens
            WHERE token = ?
            
            AND expires_at > NOW()";

    $stmt = mysqli_prepare($con, $sql);

    if (!$stmt) {
        error_log("Failed to prepare token validation statement: " . mysqli_error($con));
        mysqli_close($con);
        return false;
    }

    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);

    $tokenData = safe_fetch_assoc($stmt);

    mysqli_stmt_close($stmt);
    mysqli_close($con);

    return $tokenData ? $tokenData : false;
}

function markTokenAsUsed($token) {
    $con = getConnection();

    $sql = "UPDATE file_access_tokens SET used = TRUE WHERE token = ?";
    $stmt = mysqli_prepare($con, $sql);

    if (!$stmt) {
        mysqli_close($con);
        return false;
    }

    mysqli_stmt_bind_param($stmt, "s", $token);
    $result = mysqli_stmt_execute($stmt);

    mysqli_stmt_close($stmt);
    mysqli_close($con);

    return $result;
}

function cleanupExpiredTokens() {
    ensureTokenTableExists();

    $con = getConnection();
    $sql = "DELETE FROM file_access_tokens WHERE expires_at < NOW() ";
    mysqli_query($con, $sql);
    mysqli_close($con);
}

// Only run API endpoint logic if this file is directly accessed
if (basename($_SERVER['SCRIPT_FILENAME']) === 'fileAccessToken.php') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['formNumber'])) {
            echo json_encode(['success' => false, 'error' => 'Form number is required']);
            exit;
        }

        $formNumber = strtoupper(trim($input['formNumber']));

        if (!preg_match('/^[A-Z0-9]+$/', $formNumber)) {
            echo json_encode(['success' => false, 'error' => 'Invalid form number format']);
            exit;
        }

        $con = getConnection();
        $sql = "SELECT admissionLetter, passport FROM scholarship WHERE formNumber = ?";
        $stmt = mysqli_prepare($con, $sql);

        if (!$stmt) {
            echo json_encode(['success' => false, 'error' => 'Database error']);
            mysqli_close($con);
            exit;
        }

        mysqli_stmt_bind_param($stmt, "s", $formNumber);
        mysqli_stmt_execute($stmt);
        $formData = safe_fetch_assoc($stmt);

        mysqli_stmt_close($stmt);
        mysqli_close($con);

        if (!$formData) {
            echo json_encode(['success' => false, 'error' => 'Form not found']);
            exit;
        }

        $tokens = [];

        if (!empty($formData['admissionLetter'])) {
            $letterToken = createFileAccessToken(
                $formNumber,
                'admissionLetter',
                $formData['admissionLetter'],
                5
            );

            if ($letterToken) {
                $tokens['admissionLetter'] = $letterToken;
            }
        }

        if (!empty($formData['passport'])) {
            $passportToken = createFileAccessToken(
                $formNumber,
                'passport',
                $formData['passport'],
                5
            );

            if ($passportToken) {
                $tokens['passport'] = $passportToken;
            }
        }

        if (rand(1, 10) === 1) {
            cleanupExpiredTokens();
        }

        echo json_encode([
            'success' => true,
            'tokens' => $tokens,
            'expiresIn' => 300
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
