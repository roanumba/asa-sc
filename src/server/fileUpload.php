<?php

include_once 'dbConnection.php';

/**
 * Validates file MIME type against allowed types
 */
function validateMimeType($fileTmpPath, $allowedMimes) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fileTmpPath);
    finfo_close($finfo);

    return in_array($mimeType, $allowedMimes);
}

/**
 * Generates a secure random filename
 */
function generateSecureFilename($extension) {
    return bin2hex(random_bytes(16)) . '.' . $extension;
}

/**
 * Validates uploaded image files (checks if it's a real image)
 */
function validateImageFile($fileTmpPath) {
    $imageInfo = @getimagesize($fileTmpPath);
    return $imageInfo !== false;
}

/**
 * Updates the scholarship record with the uploaded file
 */
function updateRecord($formNumber, $fileName, $fieldToUpdate) {
    try {
        // Sanitize formNumber to prevent SQL injection
        $formNumber = strtoupper(trim($formNumber));

        if (empty($formNumber) || !preg_match('/^[A-Z0-9]+$/', $formNumber)) {
            error_log("Invalid form number format: " . $formNumber);
            return FALSE;
        }

        $con = getConnection();

        // Validate field name to prevent SQL injection
        $allowedFields = ['admissionLetter', 'passport'];
        if (!in_array($fieldToUpdate, $allowedFields)) {
            error_log("Invalid field to update: " . $fieldToUpdate);
            mysqli_close($con);
            return FALSE;
        }

        $sql = 'UPDATE scholarship SET ' . $fieldToUpdate . ' = ? WHERE formNumber = ?';
        $stmt = mysqli_prepare($con, $sql);

        if (!$stmt) {
            $error = mysqli_error($con);
            error_log("Failed to prepare statement: " . $error);
            mysqli_close($con);
            return FALSE;
        }

        mysqli_stmt_bind_param($stmt, "ss", $fileName, $formNumber);
        $result = mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);
        mysqli_close($con);

        return $result;
    } catch (Exception $exc) {
        error_log("Update record exception: " . $exc->getMessage());
        return FALSE;
    }
}

if (isset($_FILES['image'])) {
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $xplod = explode('.', $_FILES['image']['name']);
    $file_ext = strtolower(end($xplod));

    // Use FILTER_SANITIZE_FULL_SPECIAL_CHARS instead of deprecated FILTER_SANITIZE_STRING
    $formNumber = filter_input(INPUT_POST, "formNumber", FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $uploadType = filter_input(INPUT_POST, "uploadType", FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    // Validate formNumber format
    if (empty($formNumber) || !preg_match('/^[A-Z0-9]+$/i', $formNumber)) {
        echo json_encode(array("error" => true, "message" => "Invalid form number"));
        exit;
    }

    $formNumber = strtoupper($formNumber);

    // Define allowed extensions and MIME types
    $extensions = array("jpeg", "jpg", "png", "pdf");
    $allowedMimes = array(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf"
    );

    // Validate file extension
    if (in_array($file_ext, $extensions) === false) {
        echo json_encode(array("error" => true, "message" => "File type not allowed. Please choose a PDF, JPEG or PNG file."));
        exit;
    }

    // Validate file size
    if ($file_size > 2097152) {
        echo json_encode(array("error" => true, "message" => "File size must be less than 2 MB"));
        exit;
    }

    // Validate MIME type
    if (!validateMimeType($file_tmp, $allowedMimes)) {
        error_log("MIME type validation failed for file: " . $file_name);
        echo json_encode(array("error" => true, "message" => "Invalid file content. File does not match allowed types."));
        exit;
    }

    // Additional validation for images
    if (in_array($file_ext, ['jpeg', 'jpg', 'png']) && !validateImageFile($file_tmp)) {
        error_log("Image validation failed for file: " . $file_name);
        echo json_encode(array("error" => true, "message" => "Invalid image file. The file appears to be corrupted."));
        exit;
    }

    // Process passport photo upload
    if ($uploadType === 'passport') {
        // Generate secure filename
        $secureFileName = generateSecureFilename($file_ext);
        $savedFileName = $formNumber . '_' . $secureFileName;
        $uploadPath = "passports/" . $savedFileName;

        // Ensure directory exists
        if (!is_dir("passports")) {
            mkdir("passports", 0755, true);
        }

        if (move_uploaded_file($file_tmp, $uploadPath)) {
            if (updateRecord($formNumber, $savedFileName, 'passport')) {
                echo json_encode(array("error" => false, "message" => "Passport photo uploaded successfully"));
                exit;
            } else {
                // Clean up uploaded file if database update fails
                @unlink($uploadPath);
                echo json_encode(array("error" => true, "message" => "Error updating database with passport photo"));
                exit;
            }
        } else {
            error_log("Failed to move uploaded file to: " . $uploadPath);
            echo json_encode(array("error" => true, "message" => "Error uploading passport photo to server"));
            exit;
        }
    }
    // Process admission letter upload
    else {
        // Generate secure filename
        $secureFileName = generateSecureFilename($file_ext);
        $savedFileName = $formNumber . '_' . $secureFileName;
        $uploadPath = "images/" . $savedFileName;

        // Ensure directory exists
        if (!is_dir("images")) {
            mkdir("images", 0755, true);
        }

        if (move_uploaded_file($file_tmp, $uploadPath)) {
            if (updateRecord($formNumber, $savedFileName, 'admissionLetter')) {
                echo json_encode(array("error" => false, "message" => "Admission letter uploaded successfully"));
                exit;
            } else {
                // Clean up uploaded file if database update fails
                @unlink($uploadPath);
                echo json_encode(array("error" => true, "message" => "Error updating database with admission letter"));
                exit;
            }
        } else {
            error_log("Failed to move uploaded file to: " . $uploadPath);
            echo json_encode(array("error" => true, "message" => "Error uploading admission letter to server"));
            exit;
        }
    }
}
