<?php

try {

    $to = 'roanumba@ca.rr.com';
    $subject = "Please validate your email from cash2money at 9.46";
    $message = '
    Please verify your email by clicking on:
    http://www.site.com/confirmation.php?passkey=$confirm_code
    <div style="font-size:20px;color:red">Cool...</div>
    ';
    $Header = 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $Header .= 'From: Ani Ezuoke <aniezuoke@gmail.com>' . "\r\n";
    ini_set('SMTP', "relay-hosting.secureserver.net");
    ini_set('smtp_port', "25");


    if (mail($to, $subject, $message, $Header)) {

//echo header("Location: success.php");
        echo 'Sent Message';
    } else {

        echo "email sending fail";
    }
} catch (phpmailerException $e) {
    echo $e->errorMessage(); //error messages from PHPMailer
} catch (Exception $e) {
    echo $e->getMessage();
}
?>