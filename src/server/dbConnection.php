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

/**
 * Driver-independent helper to fetch a single row as an associative array from a prepared statement.
 * Works even when mysqlnd is not available.
 */
function safe_fetch_assoc($stmt) {
    if (function_exists('mysqli_stmt_get_result')) {
        $res = mysqli_stmt_get_result($stmt);
        return mysqli_fetch_assoc($res);
    }
    
    // Fallback using bind_result
    $meta = mysqli_stmt_result_metadata($stmt);
    if (!$meta) {
        return null;
    }
    
    $fields = mysqli_fetch_fields($meta);
    $row = [];
    $params = [];
    foreach ($fields as $field) {
        $params[] = &$row[$field->name];
    }
    
    call_user_func_array('mysqli_stmt_bind_result', array_merge([$stmt], $params));
    
    $copy = null;
    if (mysqli_stmt_fetch($stmt)) {
        $copy = [];
        foreach ($row as $key => $val) {
            $copy[$key] = $val;
        }
    }
    
    mysqli_free_result($meta);
    return $copy;
}

/**
 * Driver-independent helper to fetch all rows as an array of associative arrays from a prepared statement.
 * Works even when mysqlnd is not available.
 */
function safe_fetch_all($stmt) {
    if (function_exists('mysqli_stmt_get_result')) {
        $res = mysqli_stmt_get_result($stmt);
        $rows = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $rows[] = $row;
        }
        return $rows;
    }
    
    // Fallback using bind_result
    $meta = mysqli_stmt_result_metadata($stmt);
    if (!$meta) {
        return [];
    }
    
    $fields = mysqli_fetch_fields($meta);
    $row = [];
    $params = [];
    foreach ($fields as $field) {
        $params[] = &$row[$field->name];
    }
    
    call_user_func_array('mysqli_stmt_bind_result', array_merge([$stmt], $params));
    
    $rows = [];
    while (mysqli_stmt_fetch($stmt)) {
        $copy = [];
        foreach ($row as $key => $val) {
            $copy[$key] = $val;
        }
        $rows[] = $copy;
    }
    
    mysqli_free_result($meta);
    return $rows;
}
?>

