<?php
/**
 * Application REST Endpoints
 * Handles scholarship application CRUD operations
 */

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
