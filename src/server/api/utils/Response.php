<?php
/**
 * Standardized API Response Utility
 * Provides consistent JSON response format across all endpoints
 */

// Sentinel timestamp used to mark unverified (pending email verification) scholarship records.
// Records with this value have not yet confirmed their email address.
define('UNVERIFIED_TIMESTAMP', '1970-01-01 00:00:00');

class Response {
    /**
     * Send success response
     */
    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Send error response
     */
    public static function error($message, $statusCode = 400) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => $message
        ], JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Send validation error response
     */
    public static function validationError($fields, $message = 'Validation failed') {
        self::error([
            'message' => $message,
            'fields' => $fields
        ], 422);
    }

    /**
     * Log email to dev inbox file (no-op in production)
     */
    public static function logEmail($label, $identifier, $to, $mailSent) {
        $appEnv = env('APP_ENV');
        if ($appEnv === 'dev' || $appEnv === 'development') {
            $logFile = __DIR__ . '/../../../email-box.txt';
            $status = $mailSent ? 'mail-sent' : 'mail-failed';
            file_put_contents($logFile,
                date('Y-m-d H:i:s') . ' | ' . $label . ': ' . $identifier . ' | To: ' . $to . ' | ' . $status . PHP_EOL,
                FILE_APPEND
            );
        }
    }
}
