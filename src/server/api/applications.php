<?php
/**
 * Application REST Endpoints
 * Handles scholarship application CRUD operations
 */

/**
 * Init: create a minimal record (email + name), email form number to user
 */
function initApplication($input) {
    try {
        $email     = strtolower(trim($input->email ?? ''));
        $firstName = trim($input->firstName ?? '');
        $lastName  = trim($input->lastName ?? '');

        if (!$email || !$firstName || !$lastName) {
            Response::validationError(['email', 'firstName', 'lastName'], 'Email, first name and last name are required');
        }

        $con = getConnection();

        // Check for existing record with this email
        $check = mysqli_prepare($con, "SELECT formNumber FROM scholarship WHERE LOWER(email) = ? LIMIT 1");
        mysqli_stmt_bind_param($check, "s", $email);
        mysqli_stmt_execute($check);
        $checkResult = mysqli_stmt_get_result($check);
        if (mysqli_num_rows($checkResult) > 0) {
            mysqli_stmt_close($check);
            mysqli_close($con);
            Response::error('An application already exists for this email. Please use Login/Continue Application.', 409);
        }
        mysqli_stmt_close($check);

        $formNumber = strtoupper(uniqid());
        $empty = '';
        $zero  = 0;

        $sql = "INSERT INTO scholarship (
            firstName, middleName, lastName, gender, age, address,
            phoneNumber, email, parentNames, homeTown, lga, studentId,
            admissionDate, collegeName, collegeAddress, studentMajor,
            profile, formNumber, admissionLetter, passport, timeStamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param(
            $stmt, "sssssissssssssssssss",
            $firstName, $empty, $lastName, $empty, $zero, $empty,
            $empty, $email, $empty, $empty, $empty, $empty,
            $empty, $empty, $empty, $empty,
            $empty, $formNumber, $empty, $empty
        );

        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create application');
        }
        mysqli_stmt_close($stmt);
        mysqli_close($con);

        // Email the form number to the user
        require_once __DIR__ . '/../envLoader.php';
        $subject = 'ASA-SC/ASWA-SC Scholarship - Your Form Number';
        $message = '<div style="font-size:16px;text-align:center;">'
            . 'Dear ' . htmlspecialchars($firstName) . ',<br><br>'
            . 'Your scholarship application has been started.<br>'
            . 'Your form number is: <b style="font-size:22px;">' . $formNumber . '</b><br><br>'
            . 'Please save this number — you will need it to log back in and continue your application.'
            . '</div>';
        $headers  = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $headers .= 'From: info@africangalore.com' . "\r\n";
        ini_set('SMTP', 'relay-hosting.secureserver.net');
        ini_set('smtp_port', '25');
        $mailSent = mail($email, $subject, $message, $headers);

        // Dev fallback
        if (!$mailSent) {
            $logFile = '/Applications/MAMP/htdocs/asa-aswa/server/otp_dev.txt';
            file_put_contents($logFile,
                date('Y-m-d H:i:s') . ' | NEW FORM: ' . $formNumber . ' | To: ' . $email . PHP_EOL,
                FILE_APPEND
            );
        }

        Response::success([
            'formNumber' => $formNumber,
            'firstName'  => $firstName,
            'lastName'   => $lastName,
            'email'      => $email,
        ], 'Application created. Form number sent to your email.', 201);

    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Create new application
 */
function createApplication($input) {
    try {
        $con = getConnection();

        // Generate unique form number
        $formNumber = strtoupper(uniqid());

        // Prepare data
        $firstName = $input->firstName ?? '';
        $middleName = $input->middleName ?? '';
        $lastName = $input->lastName ?? '';
        $gender = $input->gender ?? '';
        $age = $input->age ?? 0;
        $address = $input->address ?? '';
        $phoneNumber = $input->phoneNumber ?? '';
        $email = $input->email ?? '';
        $parentNames = $input->parentNames ?? '';
        $homeTown = $input->homeTown ?? '';
        $lga = $input->lga ?? '';
        $studentId = $input->studentId ?? '';
        $admissionDate = $input->admissionDate ?? '';
        $collegeName = $input->collegeName ?? '';
        $collegeAddress = $input->collegeAddress ?? '';
        $studentMajor = $input->studentMajor ?? '';
        $profile = $input->profile ?? '';

        // Insert into database - include admissionLetter and passport as empty strings
        $admissionLetter = '';
        $passport = '';

        $sql = "INSERT INTO scholarship (
            firstName, middleName, lastName, gender, age, address,
            phoneNumber, email, parentNames, homeTown, lga, studentId,
            admissionDate, collegeName, collegeAddress, studentMajor,
            profile, formNumber, admissionLetter, passport, timeStamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param(
            $stmt,
            "sssssissssssssssssss",
            $firstName, $middleName, $lastName, $gender, $age, $address,
            $phoneNumber, $email, $parentNames, $homeTown, $lga, $studentId,
            $admissionDate, $collegeName, $collegeAddress, $studentMajor,
            $profile, $formNumber, $admissionLetter, $passport
        );

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            mysqli_close($con);

            Response::success([
                'formNumber' => $formNumber
            ], 'Application submitted successfully', 201);
        } else {
            throw new Exception('Failed to submit application');
        }
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Get application by form number
 */
function getApplication($formNumber) {
    try {
        $con = getConnection();

        $sql = "SELECT * FROM scholarship WHERE formNumber = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "s", $formNumber);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $application = mysqli_fetch_assoc($result);

        mysqli_stmt_close($stmt);
        mysqli_close($con);

        if ($application) {
            Response::success($application);
        } else {
            Response::error('Application not found', 404);
        }
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Update existing application
 */
function updateApplication($formNumber, $input) {
    try {
        $con = getConnection();

        // Check if application exists
        $checkSql = "SELECT formNumber FROM scholarship WHERE formNumber = ?";
        $checkStmt = mysqli_prepare($con, $checkSql);
        mysqli_stmt_bind_param($checkStmt, "s", $formNumber);
        mysqli_stmt_execute($checkStmt);
        $checkResult = mysqli_stmt_get_result($checkStmt);

        if (mysqli_num_rows($checkResult) === 0) {
            mysqli_stmt_close($checkStmt);
            mysqli_close($con);
            Response::error('Application not found', 404);
        }
        mysqli_stmt_close($checkStmt);

        // Update data
        $firstName = $input->firstName ?? '';
        $middleName = $input->middleName ?? '';
        $lastName = $input->lastName ?? '';
        $gender = $input->gender ?? '';
        $age = $input->age ?? 0;
        $address = $input->address ?? '';
        $phoneNumber = $input->phoneNumber ?? '';
        $email = $input->email ?? '';
        $parentNames = $input->parentNames ?? '';
        $homeTown = $input->homeTown ?? '';
        $lga = $input->lga ?? '';
        $studentId = $input->studentId ?? '';
        $admissionDate = $input->admissionDate ?? '';
        $collegeName = $input->collegeName ?? '';
        $collegeAddress = $input->collegeAddress ?? '';
        $studentMajor = $input->studentMajor ?? '';
        $profile = $input->profile ?? '';

        $sql = "UPDATE scholarship SET
            firstName = ?, middleName = ?, lastName = ?, gender = ?, age = ?,
            address = ?, phoneNumber = ?, email = ?, parentNames = ?,
            homeTown = ?, lga = ?, studentId = ?, admissionDate = ?,
            collegeName = ?, collegeAddress = ?, studentMajor = ?, profile = ?
            WHERE formNumber = ?";

        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param(
            $stmt,
            "ssssisssssssssssss",
            $firstName, $middleName, $lastName, $gender, $age, $address,
            $phoneNumber, $email, $parentNames, $homeTown, $lga, $studentId,
            $admissionDate, $collegeName, $collegeAddress, $studentMajor,
            $profile, $formNumber
        );

        if (mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            mysqli_close($con);

            Response::success([
                'formNumber' => $formNumber
            ], 'Application updated successfully');
        } else {
            throw new Exception('Failed to update application');
        }
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}
