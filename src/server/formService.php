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

        $sql = 'Insert into scholarship (' . implode(", ", getFieds()) . ') value (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

        $stmt = mysqli_prepare($con, $sql);
        $formNumber = strtoupper(uniqid('', false));
        $createdDate = date("Y-m-d H:i:s");
        mysqli_stmt_bind_param($stmt, "ssssissssssssssssss",
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
            $formNumber
        );

        mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);

        mysqli_close($con);
        return array("formNumber" => $formNumber);
    } catch (Exception $exc) {
        $error = $exc->getMessage();
        return array('error' => TRUE, 'errorMsg' => $error);
    }
}

function updateRecord($param)
{
    try {

        $con = getConnection();

        $sql = 'update scholarship set ';
        $flds = getFieds();
        for ($idx = 0; $idx < count($flds) - 1; $idx++) {
            if ($idx == 0) {
                $sql .= $flds[$idx] . '=?';
            } else {
                $sql .= ', ' . $flds[$idx] . '=?';
            }
        }

        $sql .= ' where formNumber=?';

        $stmt = mysqli_prepare($con, $sql);
        $createdTime = date("Y-m-d H:i:s");
        mysqli_stmt_bind_param($stmt, "ssssissssssssssssss",
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

        mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);

        mysqli_close($con);
        return array("formNumber" => $param->formNumber);
    } catch (Exception $exc) {
        $error = $exc->getMessage();
        return array('error' => TRUE, 'errorMsg' => $error);
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
        return array('error' => TRUE, 'errorMsg' => $error);
    }
}

