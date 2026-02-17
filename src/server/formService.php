<?php
include 'dbConnection.php';

include 'clientHandler.php';

function getFieds()
{
    return array(
        'firstName',
        'middleName',
        'lastName',
        'gender',
        'age',
        'address',
        'phoneNumber',
        'email',
        'parentNames',
        'homeTown',
        'lga',
        'studentId',
        'admissionDate',
        'collegeName',
        'collegeAddress',
        'studentMajor',
        'timeStamp',
        'profile',
        'formNumber',
        'admissionLetter',
        'passport',
    );
}

function saveForm($params)
{
    return $params;
}

function submitForm($param)
{
    try {

        $con = getConnection();

        $sql = 'Insert into scholarship (' . implode(", ", getFieds()) . ') value (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

        $stmt = mysqli_prepare($con, $sql);

        if (!$stmt) {
            $error = mysqli_error($con);
            error_log("Failed to prepare statement: " . $error);
            throw new Exception("Database prepare error: " . $error);
        }

        $formNumber = strtoupper(uniqid('', false));
        $createdDate = date("Y-m-d H:i:s");
        $emptyAdmissionLetter = '';
        $emptyPassport = '';

        $bindResult = mysqli_stmt_bind_param($stmt, "ssssissssssssssssssss",
            $param->firstName,
            $param->middleName,
            $param->lastName,
            $param->gender,
            $param->age,
            $param->address,
            $param->phoneNumber,
            $param->email,
            $param->parentNames,
            $param->homeTown,
            $param->lga,
            $param->studentId,
            $param->admissionDate,
            $param->collegeName,
            $param->collegeAddress,
            $param->studentMajor,
            $createdDate,
            $param->profile,
            $formNumber,
            $emptyAdmissionLetter,
            $emptyPassport
        );

        if (!$bindResult) {
            $error = mysqli_stmt_error($stmt);
            error_log("Failed to bind parameters: " . $error);
            throw new Exception("Parameter binding error: " . $error);
        }

        $execResult = mysqli_stmt_execute($stmt);

        if (!$execResult) {
            $error = mysqli_stmt_error($stmt);
            error_log("Failed to execute statement: " . $error);
            throw new Exception("Execution error: " . $error);
        }

        mysqli_stmt_close($stmt);

        mysqli_close($con);
        return array("formNumber" => $formNumber);
    } catch (Exception $exc) {
        $error = $exc->getMessage();
        error_log("Form submission exception: " . $error);
        // return array('error' => TRUE, 'errorMsg' => $error);
        throw $exc;
    }
}

function updateRecord($param)
{
    try {

        $con = getConnection();

        $sql = 'update scholarship set ';
        $flds = getFieds();
        // Build SET clause for all fields except the last 3 (formNumber, admissionLetter, passport)
        // We don't update admissionLetter and passport here - they're updated via fileUpload.php
        for ($idx = 0; $idx < count($flds) - 3; $idx++) {
            if ($idx == 0) {
                $sql .= $flds[$idx] . '=?';
            } else {
                $sql .= ', ' . $flds[$idx] . '=?';
            }
        }

        $sql .= ' where formNumber=?';

        $stmt = mysqli_prepare($con, $sql);

        if (!$stmt) {
            $error = mysqli_error($con);
            error_log("Failed to prepare update statement: " . $error);
            throw new Exception("Database prepare error: " . $error);
        }

        $createdTime = date("Y-m-d H:i:s");

        $bindResult = mysqli_stmt_bind_param($stmt, "ssssissssssssssssss",
            $param->firstName,
            $param->middleName,
            $param->lastName,
            $param->gender,
            $param->age,
            $param->address,
            $param->phoneNumber,
            $param->email,
            $param->parentNames,
            $param->homeTown,
            $param->lga,
            $param->studentId,
            $param->admissionDate,
            $param->collegeName,
            $param->collegeAddress,
            $param->studentMajor,
            $createdTime,
            $param->profile,
            $param->formNumber
        );

        if (!$bindResult) {
            $error = mysqli_stmt_error($stmt);
            error_log("Failed to bind update parameters: " . $error);
            throw new Exception("Parameter binding error: " . $error);
        }

        $execResult = mysqli_stmt_execute($stmt);

        if (!$execResult) {
            $error = mysqli_stmt_error($stmt);
            error_log("Failed to execute update statement: " . $error);
            throw new Exception("Execution error: " . $error);
        }

        mysqli_stmt_close($stmt);

        mysqli_close($con);
        return array("formNumber" => $param->formNumber);
    } catch (Exception $exc) {
        $error = $exc->getMessage();
        error_log("Form update exception: " . $error);
        // return array('error' => TRUE, 'errorMsg' => $error);
        throw $exc;
    }
}

function findFormByFormNumber($params)
{
    try {
        $formNo = strtoupper($params->formNumber);
        $con = getConnection();

        $sql = "select * from  scholarship where formNumber= '" . $formNo . "'";
        $result = mysqli_query($con, $sql);

        $row = mysqli_fetch_array($result, MYSQLI_ASSOC);

        mysqli_close($con);
        return $row;
    } catch (Exception $exc) {
        $error = $exc->getMessage();
        // return array('error' => TRUE, 'errorMsg' => $error);
        throw new Exception("Unknown system error during form retrieval");
    }
}

function uploadAdmissionLetter()
{

}
