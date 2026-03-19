<?php
/**
 * Simple Session-Based Authentication
 */

// Admin credentials loaded from .env
define('ADMIN_USERNAME', env('ADMIN_USERNAME'));
define('ADMIN_PASSWORD', env('ADMIN_PASSWORD'));

/**
 * Handle admin login
 */
function handleLogin($input) {
    if (!isset($input->username) || !isset($input->password)) {
        Response::validationError(['username', 'password'], 'Username and password required');
    }

    $username = trim($input->username);
    $password = $input->password;

    // Check credentials
    if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
        // Set session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        $_SESSION['login_time'] = time();

        Response::success([
            'username' => $username,
            'role' => 'admin'
        ], 'Login successful');
    } else {
        // Add small delay to prevent brute force
        sleep(1);
        Response::error('Invalid credentials', 401);
    }
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
