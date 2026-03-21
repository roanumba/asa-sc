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
        $email      = strtolower(trim($input->email ?? ''));
        $firstName  = trim($input->firstName ?? '');
        $middleName = trim($input->middleName ?? '');
        $lastName   = trim($input->lastName ?? '');

        if (!$email || !$firstName || !$lastName) {
            Response::validationError(['email', 'firstName', 'lastName'], 'Email, first name and last name are required');
        }

        $con = getConnection();

        // "Verified" = timeStamp IS NOT NULL. Unverified temp records have timeStamp = NULL.

        // Check for existing verified record with this email
        $check = mysqli_prepare($con, "SELECT formNumber FROM scholarship WHERE LOWER(email) = ? AND timeStamp != '" . UNVERIFIED_TIMESTAMP . "' LIMIT 1");
        mysqli_stmt_bind_param($check, "s", $email);
        mysqli_stmt_execute($check);
        $checkResult = mysqli_stmt_get_result($check);
        if (mysqli_num_rows($checkResult) > 0) {
            mysqli_stmt_close($check);
            mysqli_close($con);
            Response::error('An application already exists for this email. Please use Login/Continue Application.', 409);
        }
        mysqli_stmt_close($check);

        // Check for same name already registered (case-insensitive) — flag potential duplicate
        $nameCheck = mysqli_prepare($con,
            "SELECT formNumber FROM scholarship WHERE LOWER(firstName) = ? AND LOWER(lastName) = ? AND timeStamp != '" . UNVERIFIED_TIMESTAMP . "' LIMIT 1"
        );
        $fnLower = strtolower($firstName);
        $lnLower = strtolower($lastName);
        mysqli_stmt_bind_param($nameCheck, "ss", $fnLower, $lnLower);
        mysqli_stmt_execute($nameCheck);
        $nameResult = mysqli_stmt_get_result($nameCheck);
        if (mysqli_num_rows($nameResult) > 0) {
            mysqli_stmt_close($nameCheck);
            mysqli_close($con);
            Response::error(
                'An application already exists for someone with this name. If this is you, please use Login/Continue Application with your original email.',
                409
            );
        }
        mysqli_stmt_close($nameCheck);

        // Delete any previous unverified temp records for this email (cleanup stale attempts)
        $del = mysqli_prepare($con, "DELETE FROM scholarship WHERE LOWER(email) = ? AND timeStamp = '" . UNVERIFIED_TIMESTAMP . "'");
        mysqli_stmt_bind_param($del, "s", $email);
        mysqli_stmt_execute($del);
        mysqli_stmt_close($del);

        $formNumber = strtoupper(uniqid());
        $empty = '';
        $zero  = 0;

        // Insert with timeStamp = UNVERIFIED_TIMESTAMP to mark as unverified (pending email verification)
        $sql = "INSERT INTO scholarship (
            firstName, middleName, lastName, gender, age, address,
            phoneNumber, email, parentNames, homeTown, lga, studentId,
            admissionDate, collegeName, collegeAddress, studentMajor,
            profile, formNumber, admissionLetter, passport, timeStamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '" . UNVERIFIED_TIMESTAMP . "')";

        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param(
            $stmt, "sssssissssssssssssss",
            $firstName, $middleName, $lastName, $empty, $zero, $empty,
            $empty, $email, $empty, $empty, $empty, $empty,
            $empty, $empty, $empty, $empty,
            $empty, $formNumber, $empty, $empty
        );

        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception('Failed to create application');
        }
        mysqli_stmt_close($stmt);
        mysqli_close($con);

        // Email the form number — user must enter it to verify email and activate record
        require_once __DIR__ . '/../envLoader.php';
        $subject = 'ASA-SC/ASWA-SC Scholarship - Verify Your Email';
        $message = '<div style="font-size:16px;text-align:center;">'
            . 'Dear ' . htmlspecialchars($firstName) . ',<br><br>'
            . 'Your scholarship application has been started.<br>'
            . 'Your form number is: <b style="font-size:22px;">' . $formNumber . '</b><br><br>'
            . 'Please enter this number on the verification page to confirm your email and activate your application.<br>'
            . 'If you did not request this, you can ignore this email.'
            . '</div>';
        $headers  = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $headers .= 'From: info@africangalore.com' . "\r\n";
        ini_set('SMTP', 'relay-hosting.secureserver.net');
        ini_set('smtp_port', '25');
        $mailSent = mail($email, $subject, $message, $headers);

        Response::logEmail('NEW FORM', $formNumber, $email, $mailSent);

        Response::success([
            'firstName' => $firstName,
            'lastName'  => $lastName,
            'email'     => $email,
        ], 'A verification form number has been sent to your email. Please enter it to continue.', 201);

    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}

/**
 * Verify a pending application: user enters the form number sent to their email.
 * On success: sets timeStamp = NOW() (marks record as verified) and returns formNumber.
 * On failure: deletes the temp record so they must start over.
 */
function verifyApplication($input) {
    try {
        $email      = strtolower(trim($input->email ?? ''));
        $formNumber = strtoupper(trim($input->formNumber ?? ''));

        if (!$email || !$formNumber) {
            Response::validationError(['email', 'formNumber'], 'Email and form number are required');
        }

        $con = getConnection();

        // Look up the unverified record (timeStamp IS NULL = pending verification)
        $stmt = mysqli_prepare($con,
            "SELECT formNumber FROM scholarship WHERE LOWER(email) = ? AND timeStamp = '" . UNVERIFIED_TIMESTAMP . "' LIMIT 1"
        );
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        if (!$row) {
            mysqli_close($con);
            Response::error('No pending application found for this email.', 404);
        }

        if (strtoupper($row['formNumber']) !== $formNumber) {
            // Track failed attempts in session (session already started in index.php)
            $attemptKey = 'verify_attempts_' . md5($email);
            $_SESSION[$attemptKey] = ($_SESSION[$attemptKey] ?? 0) + 1;
            $attemptsLeft = 3 - $_SESSION[$attemptKey];

            if ($attemptsLeft <= 0) {
                // 3 strikes — delete the temp record and force restart
                unset($_SESSION[$attemptKey]);
                $del = mysqli_prepare($con, "DELETE FROM scholarship WHERE LOWER(email) = ? AND timeStamp = '" . UNVERIFIED_TIMESTAMP . "'");
                mysqli_stmt_bind_param($del, "s", $email);
                mysqli_stmt_execute($del);
                mysqli_stmt_close($del);
                mysqli_close($con);
                sleep(1);
                Response::error('Too many incorrect attempts. Your temporary application has been removed. Please start again with the correct email address.', 410);
            }

            mysqli_close($con);
            sleep(1);
            Response::error('Incorrect form number. ' . $attemptsLeft . ' attempt' . ($attemptsLeft === 1 ? '' : 's') . ' remaining.', 401);
        }

        // Clear attempt counter on success
        unset($_SESSION['verify_attempts_' . md5($email)]);

        // Verify: stamp the record with current time
        $upd = mysqli_prepare($con, "UPDATE scholarship SET timeStamp = NOW() WHERE LOWER(email) = ? AND timeStamp = '" . UNVERIFIED_TIMESTAMP . "'");
        mysqli_stmt_bind_param($upd, "s", $email);
        mysqli_stmt_execute($upd);
        mysqli_stmt_close($upd);
        mysqli_close($con);

        Response::success([
            'formNumber' => $row['formNumber'],
            'email'      => $email,
        ], 'Email verified. Your application is now active.');

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

        mysqli_stmt_execute($stmt);
        $affected = mysqli_stmt_affected_rows($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($con);

        if ($affected === 0) {
            Response::error('Application not found', 404);
        }
        Response::success(['formNumber' => $formNumber], 'Application updated successfully');
    } catch (Exception $e) {
        Response::error($e->getMessage(), 500);
    }
}
