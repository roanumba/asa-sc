<?php

/**
 * Simple environment variable loader
 * Loads variables from .env file into $_ENV superglobal
 */
function loadEnv($filePath = __DIR__ . '/.env') {
    if (!file_exists($filePath)) {
        throw new Exception(".env file not found at: " . $filePath);
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse KEY=VALUE pairs
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes from value if present
            if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                $value = $matches[2];
            }

            // Set environment variable
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

/**
 * Get environment variable with optional default value
 */
function env($key, $default = null) {
    if (isset($_ENV[$key])) {
        return $_ENV[$key];
    }

    $value = getenv($key);
    return $value !== false ? $value : $default;
}

// Auto-load .env file when this file is included
try {
    loadEnv();
} catch (Exception $e) {
    error_log("Environment loading error: " . $e->getMessage());
    // Continue execution - will use defaults or fail gracefully
}