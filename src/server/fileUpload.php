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
    $errors = TRUE;
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $xplod = explode('.', $_FILES['image']['name']);
    $file_ext = strtolower(end($xplod));

    $msg = 'Upload file name: <b>' . htmlspecialchars($file_name) . '</b><br/>';

    $formNumber = filter_input(INPUT_POST, "formNumber", FILTER_SANITIZE_STRING);
    $uploadType = filter_input(INPUT_POST, "uploadType", FILTER_SANITIZE_STRING);

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
        $msg .= 'File type NOT allowed, please choose a PDF, JPEG or PNG file.';
    }
    // Validate file size
    else if ($file_size > 2097152) {
        $msg .= 'File size MUST be less than 2 MB';
    }
    // Validate MIME type
    else if (!validateMimeType($file_tmp, $allowedMimes)) {
        $msg .= 'Invalid file content. File does not match allowed types.';
        error_log("MIME type validation failed for file: " . $file_name);
    }
    // Additional validation for images
    else if (in_array($file_ext, ['jpeg', 'jpg', 'png']) && !validateImageFile($file_tmp)) {
        $msg .= 'Invalid image file. The file appears to be corrupted or is not a valid image.';
        error_log("Image validation failed for file: " . $file_name);
    }
    // Process passport photo upload
    else if ($uploadType === 'passport') {
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
                $msg .= 'Passport photo is successfully uploaded';
                $errors = FALSE;
            } else {
                // Clean up uploaded file if database update fails
                @unlink($uploadPath);
                $msg .= 'Error updating database with passport photo.';
            }
        } else {
            $msg .= 'Error uploading passport photo to server.';
            error_log("Failed to move uploaded file to: " . $uploadPath);
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
                $msg .= 'Admission letter is successfully uploaded';
                $errors = FALSE;
            } else {
                // Clean up uploaded file if database update fails
                @unlink($uploadPath);
                $msg .= 'Error updating database with admission letter.';
            }
        } else {
            $msg .= 'Error uploading admission letter to server.';
            error_log("Failed to move uploaded file to: " . $uploadPath);
        }
    }

    echo json_encode(array("error" => $errors, "message" => $msg));
}
