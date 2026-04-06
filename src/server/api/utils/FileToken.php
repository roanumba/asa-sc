<?php
/**
 * File Access Token utility
 * Consolidated from fileAccessToken.php and generateDownloadToken.php
 * Uses DB-backed tokens (5-minute expiry, multi-use until expiry)
 */

function ensureTokenTable(): void {
    $con = getConnection();
    mysqli_query($con, "CREATE TABLE IF NOT EXISTS file_access_tokens (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        token      VARCHAR(64) UNIQUE NOT NULL,
        form_number VARCHAR(20) NOT NULL,
        file_type  ENUM('admissionLetter','passport') NOT NULL,
        file_name  VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        INDEX idx_token   (token),
        INDEX idx_expires (expires_at),
        INDEX idx_form    (form_number)
    )");
    mysqli_close($con);
}

function createFileToken(string $formNumber, string $fileType, string $fileName, int $expiryMinutes = 5): string|false {
    ensureTokenTable();
    $con       = getConnection();
    $token     = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + $expiryMinutes * 60);
    $stmt = mysqli_prepare($con,
        "INSERT INTO file_access_tokens (token, form_number, file_type, file_name, expires_at) VALUES (?,?,?,?,?)"
    );
    mysqli_stmt_bind_param($stmt, "sssss", $token, $formNumber, $fileType, $fileName, $expiresAt);
    $ok = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    return $ok ? $token : false;
}

function validateFileToken(string $token): array|false {
    ensureTokenTable();
    $con  = getConnection();
    $stmt = mysqli_prepare($con,
        "SELECT * FROM file_access_tokens WHERE token = ? AND expires_at > NOW()"
    );
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $row = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    return $row ?: false;
}

function pruneExpiredTokens(): void {
    $con = getConnection();
    mysqli_query($con, "DELETE FROM file_access_tokens WHERE expires_at < NOW()");
    mysqli_close($con);
}
