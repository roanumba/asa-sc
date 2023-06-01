<?php

include 'dbConnection.php';

function updateRecord($formNumber, $fileName,$fieldToUpdate) {
    try {

        $con = getConnection();

        $sql = 'update scholarship set '.$fieldToUpdate.' = ? where formNumber=?';

        $stmt = mysqli_prepare($con, $sql);

        mysqli_stmt_bind_param($stmt, "ss", $fileName, $formNumber);

        mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);

        mysqli_close($con);
        return TRUE;
    } catch (Exception $exc) {

        return FALSE;
    }
}

if (isset($_FILES['image'])) {
    $errors = TRUE;
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $xplod=explode('.', $_FILES['image']['name']);
    $file_ext = strtolower(end($xplod));

    $msg = 'Upload file name: <b>' . $file_name . '</b><br/>';

    $formNumber = filter_input(INPUT_POST, "formNumber");
    $uploadType = filter_input(INPUT_POST, "uploadType");
    $extensions = array("jpeg", "jpg", "png", "pdf");

    if (in_array($file_ext, $extensions) === false) {
        $msg .= 'File type NOT allowed, please choose a PDF, JPEG or PNG file. ';
    } else if ($file_size > 2097152) {
        $msg .= 'File size MUST be less than 2 MB';
    }else if($uploadType==='passport'){
        $savedFileName = $formNumber . '_' . $file_name;
        move_uploaded_file($file_tmp, "passports/" . $savedFileName);

        if (updateRecord($formNumber, $savedFileName,'passport')) {
            $msg .= 'Passport photo is successfully uploaded';
            $errors = FALSE;
        } else {
            $msg .= 'Error uploading passport sized photo.';
        }
    } else {
        $savedFileName = $formNumber . '_' . $file_name;
        move_uploaded_file($file_tmp, "images/" . $savedFileName);

        if (updateRecord($formNumber, $savedFileName,'admissionLetter')) {
            $msg .= 'Admission letter is successfully uploaded';
            $errors = FALSE;
        } else {
            $msg .= 'Error uploading letter of admission.';
        }
    }
    echo (json_encode(array("error" => $errors, "message" => $msg)));
}


