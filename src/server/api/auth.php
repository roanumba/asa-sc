<?php
/**
 * Simple Session-Based Authentication with 2FA
 */

// Admin credentials are now validated against the admin_users table in the database

/**
 * Applicant lookup: check email, then verify form number as passcode
 */
function lookupApplicant($input) {
    if (!isset($input->email)) {
        Response::validationError(['email'], 'Email is required');
    }

    $email = strtolower(trim($input->email));

    require_once __DIR__ . '/../dbConnection.php';
    $con = getConnection();

    // Check if input is an admin email or username
    $stmtAdmin = mysqli_prepare($con, "SELECT id FROM admin_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1");
    mysqli_stmt_bind_param($stmtAdmin, "ss", $email, $email);
    mysqli_stmt_execute($stmtAdmin);
    $isAdmin = safe_fetch_assoc($stmtAdmin);
    mysqli_stmt_close($stmtAdmin);
    
    if ($isAdmin) {
        mysqli_close($con);
        Response::success(['redirect' => 'admin'], 'Please use admin login');
    }

    $stmt = mysqli_prepare($con, "SELECT formNumber, firstName FROM scholarship WHERE LOWER(email) = ? AND timeStamp != '" . UNVERIFIED_TIMESTAMP . "' LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $row = safe_fetch_assoc($stmt);
    mysqli_stmt_close($stmt);
    mysqli_close($con);

    if (!$row) {
        // No record found — let frontend offer to start a new form
        Response::success(['found' => false], 'No application found for this email');
    }

    // Record exists — if formNumber provided, verify it
    if (isset($input->formNumber)) {
        $formNumber = strtoupper(trim($input->formNumber));
        if ($formNumber === strtoupper($row['formNumber'])) {
            Response::success([
                'found'      => true,
                'verified'   => true,
                'formNumber' => $row['formNumber'],
                'firstName'  => $row['firstName']
            ], 'Verified');
        } else {
            sleep(1);
            Response::error('Invalid form number', 401);
        }
    }

    // Record exists but no formNumber submitted yet — ask for it
    Response::success(['found' => true, 'verified' => false], 'Application found. Please enter your form number.');
}

/**
 * Step 1: Verify credentials, generate OTP, send email
 */
function handleLogin($input) {
    if (!isset($input->username) || !isset($input->password)) {
        Response::validationError(['username', 'password'], 'Username and password required');
    }

    $username = trim($input->username);
    $password = $input->password;

    require_once __DIR__ . '/../dbConnection.php';
    $con = getConnection();

    $stmt = mysqli_prepare($con, "SELECT password_hash, email FROM admin_users WHERE username = ? AND is_active = 1 LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $row = safe_fetch_assoc($stmt);
    mysqli_stmt_close($stmt);
    
    $isValid = false;
    $adminEmail = null;
    
    if ($row && password_verify($password, $row['password_hash'])) {
        $isValid = true;
        $adminEmail = $row['email'];
        // Update last_login
        $updateStmt = mysqli_prepare($con, "UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE username = ?");
        mysqli_stmt_bind_param($updateStmt, "s", $username);
        mysqli_stmt_execute($updateStmt);
        mysqli_stmt_close($updateStmt);
    }
    mysqli_close($con);

    if ($isValid) {
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in session with 5-minute expiry
        $_SESSION['2fa_otp'] = $otp;
        $_SESSION['2fa_expires'] = time() + 300;
        $_SESSION['2fa_username'] = $username;

        // Send OTP email
        $to = $adminEmail;
        if (!$to) {
            error_log('2FA: Admin email not configured in database for user ' . $username);
            Response::error('Admin email not configured', 500);
        }
        require_once __DIR__ . '/utils/mailService.php';
        $subject  = 'Admin Login - Verification Code';
        $body     = '<div style="font-size:16px;text-align:center;">'
            . 'Your login verification code is: <b style="font-size:24px;">' . $otp . '</b><br>'
            . 'This code expires in 5 minutes.'
            . '</div>';
        $mailSent = sendEmail($to, $subject, $body);

        Response::logEmail('OTP', $otp, $to, $mailSent);

        if (!$mailSent) {
            // Log OTP code to PHP error log as emergency fallback if SMTP fails
            error_log("EMERGENCY 2FA: Email failed to send to $to. Verification Code: $otp");
        }

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
