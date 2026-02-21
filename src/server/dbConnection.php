<?php

require_once __DIR__ . '/envLoader.php';

function getConnection() {
    // Load database credentials from environment variables
    $dbhost = env('DB_HOST', 'localhost');
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASSWORD', 'root');
    $db = env('DB_NAME', 'asa_sc');

    // Try to connect
    $con = mysqli_connect($dbhost, $user, $pass, $db);

    // If connection fails, provide detailed error
    if (!$con) {
        error_log("MySQL Connection Error: " . mysqli_connect_error());

        // Don't expose detailed connection errors in production
        if (env('APP_ENV', 'production') === 'development') {
            throw new Exception("Database connection failed: " . mysqli_connect_error());
        } else {
            throw new Exception("Database connection failed. Please contact support.");
        }
    }

    // Set charset to UTF-8 for security
    mysqli_set_charset($con, 'utf8mb4');

    return $con;
}
?>

