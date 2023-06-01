<?php
include 'dbConnection.php';


$formNumber = $_REQUEST['formNumber'];
$deadline = $_REQUEST['deadline'];
$year = $_REQUEST['year'];
$row = findFormByFormNumber($formNumber);
$error = sendMail($row, $formNumber,$year,$deadline);
echo '<<==>>';
echo(json_encode(array("dataRows" => convertToKeyValue($row),
    "noAdmissionLetter" => !$row["admissionLetter"], 
    "noPassportPhoto" => !$row["passport"],
    "mailError" => $error)));


function convertToKeyValue($row)
{
    $dataRows = array();
    foreach ($row as $key => $value) {
        if ($key !== 'admissionLetter' && $key !== 'passport') {
            $string = preg_replace('/(?<=\\w)(?=[A-Z])/', " $1", $key);
            $dataRows[] = array("key" => strtoupper(trim($string)), "value" => $value);
        }
    }
    return $dataRows;
}

function findFormByFormNumber($formNo)
{
    try {
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

function sendMail($row, $formNumber,$year,$deadline)
{
    $error = '';
    try {
        /*        $admissionLetterNotSent = '<div style="font-size: 16px;text-align: center; color:red">'
                    . 'You have not uploaded your admission letter. '
                    . 'Please upload by '.$deadline.'.<br/>'
                    . 'Make sure your form number <b>' . $formNumber . '</b> is included.'
                    . '</div>';
                $passportNotSent = '<div style="font-size: 16px;text-align: center; color:red">'
                    . 'You have not uploaded your passport sized photo. '
                    . 'Please send it to <b>aniezuoke@gmail.com</b> by '.$deadline.'.<br/>'
                    . 'Make sure your form number <b>' . $formNumber . '</b> is included.'
                    . '</div>';       */
        $to = $row["email"];
        $admission = $row["admissionLetter"];
        $passport = $row["passport"];
        $subject = "ASA-SC/ASWA-SC Scholarship Forms";
        $message = '<div style="font-size: 16px;text-align: center;">'
            . 'Thank you for Filling the ASA-SC/ASWA-SC '.$year.' Scholarship Forms.'
            . 'You application form number is <b>' . $formNumber . '</b>'
            . '</div>';
        if (!$admission && !$passport) {
            $message .= ' <div style="font-size: 16px;text-align: center; color:red">'
                . 'You have not uploaded you admission letter and passport sized photo. Please use the provided form number <br/>'
                . ' to upload your admission letter and passport photo by '.$deadline.'.'
                . '</div>';
        } else if (!$passport) {
            $message .= ' <div style="font-size: 16px;text-align: center; color:red">'
                . 'You have not uploaded you passport sized photo. Please use the provided form number <br/>'
                . ' to upload your passport sized photo by '.$deadline.'.'
                . '</div>';

        } else if (!$admission) {
            $message .= ' <div style="font-size: 16px;text-align: center; color:red">'
                . 'You have not uploaded you admission letter. Please use the provided form number <br/>'
                . ' to upload your admission letter by '.$deadline.'.'
                . '</div>';
        }
        $Header = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
        $Header .= 'From: info@africangalore.com' . "\r\n";
        ini_set('SMTP', "relay-hosting.secureserver.net");
        ini_set('smtp_port', "25");
        $success = mail($to, $subject, $message, $Header);

        $e = error_get_last();
        $error = $e['message'];

    } catch (Exception $ex) {
        $error = $ex->getMessage();
    }
    return $error;
}
