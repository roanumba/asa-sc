<?php
/**
 * Simple Session-Based Authentication with 2FA
 */

// Admin credentials loaded from .env
define('ADMIN_USERNAME', env('ADMIN_USERNAME'));
define('ADMIN_PASSWORD', env('ADMIN_PASSWORD'));
define('ADMIN_2FA_EMAIL', env('ADMIN_2FA_EMAIL'));

/**
 * Step 1: Verify credentials, generate OTP, send email
 */
function handleLogin($input) {
    if (!isset($input->username) || !isset($input->password)) {
        Response::validationError(['username', 'password'], 'Username and password required');
    }

    $username = trim($input->username);
    $password = $input->password;

    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in session with 5-minute expiry
        $_SESSION['2fa_otp'] = $otp;
        $_SESSION['2fa_expires'] = time() + 300;
        $_SESSION['2fa_username'] = $username;

        // Send OTP email
        $to = ADMIN_2FA_EMAIL;
        if (!$to) {
            error_log('2FA: ADMIN_2FA_EMAIL is not set in .env');
            Response::error('Admin email not configured', 500);
        }
        $subject = 'Admin Login - Verification Code';
        $message = '<div style="font-size:16px;text-align:center;">'
            . 'Your login verification code is: <b style="font-size:24px;">' . $otp . '</b><br>'
            . 'This code expires in 5 minutes.'
            . '</div>';
        $headers  = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $headers .= 'From: info@africangalore.com' . "\r\n";
        ini_set('SMTP', 'relay-hosting.secureserver.net');
        ini_set('smtp_port', '25');

        $mailSent = mail($to, $subject, $message, $headers);

        // Always write to file for local dev (harmless on production)
        $logFile = '/Applications/MAMP/htdocs/asa-aswa/server/otp_dev.txt';
        $status = $mailSent ? 'mail-sent' : 'mail-failed';
        file_put_contents($logFile, date('Y-m-d H:i:s') . ' | OTP: ' . $otp . ' | To: ' . $to . ' | ' . $status . PHP_EOL, FILE_APPEND);

        Response::success(['step' => 'otp'], 'Verification code sent to admin email');
    } else {
        sleep(1);
        Response::error('Invalid credentials', 401);
    }
}

/**
 * Step 2: Verify OTP and grant session
 */
function handleVerifyOtp($input) {
    if (!isset($input->otp)) {
        Response::validationError(['otp'], 'Verification code required');
    }

    $otp = trim($input->otp);

    if (
        !isset($_SESSION['2fa_otp']) ||
        !isset($_SESSION['2fa_expires']) ||
        !isset($_SESSION['2fa_username'])
    ) {
        Response::error('No pending verification. Please login again.', 401);
    }

    if (time() > $_SESSION['2fa_expires']) {
        unset($_SESSION['2fa_otp'], $_SESSION['2fa_expires'], $_SESSION['2fa_username']);
        Response::error('Verification code expired. Please login again.', 401);
    }

    if ($otp !== $_SESSION['2fa_otp']) {
        sleep(1);
        Response::error('Invalid verification code', 401);
    }

    // OTP valid — grant full session
    $username = $_SESSION['2fa_username'];
    unset($_SESSION['2fa_otp'], $_SESSION['2fa_expires'], $_SESSION['2fa_username']);

    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['login_time'] = time();

    Response::success([
        'username' => $username,
        'role' => 'admin'
    ], 'Login successful');
}

/**
 * Handle admin logout
 */
function handleLogout() {
    session_destroy();
    Response::success(null, 'Logged out successfully');
}

/**
 * Check if admin is logged in
 */
function checkSession() {
    if (isAdminLoggedIn()) {
        Response::success([
            'authenticated' => true,
            'username' => $_SESSION['admin_username']
        ]);
    } else {
        Response::success([
            'authenticated' => false
        ]);
    }
}

/**
 * Verify admin is logged in (middleware function)
 */
function requireAdmin() {
    if (!isAdminLoggedIn()) {
        Response::error('Authentication required', 401);
    }
}

/**
 * Helper to check if admin is logged in
 */
function isAdminLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}
