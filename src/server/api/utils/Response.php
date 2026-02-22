<?php
/**
 * Standardized API Response Utility
 * Provides consistent JSON response format across all endpoints
 */
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
}
