<?php
/**
 * PHPMailer factory
 * Returns a configured PHPMailer instance ready to send.
 * Caller sets: $mail->addAddress(), $mail->Subject, $mail->Body
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as MailException;

function createMailer(): PHPMailer {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host    = env('SMTP_HOST', 'relay-hosting.secureserver.net');
    $mail->Port    = (int) env('SMTP_PORT', 25);
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->setFrom(env('EMAIL_FROM', 'info@africangalore.com'));

    // Enable SMTP auth when credentials are provided (e.g. Gmail in dev)
    $smtpUser = env('SMTP_USER');
    $smtpPass = env('SMTP_PASS');
    if ($smtpUser && $smtpPass) {
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = (int) env('SMTP_PORT', 25) === 465
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPAuth = false;
    }

    return $mail;
}

/**
 * Send an HTML email. Returns true on success, false on failure.
 * Errors are logged automatically.
 */
function sendEmail(string $to, string $subject, string $htmlBody): bool {
    try {
        $mail = createMailer();
        $mail->addAddress($to);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->send();
        return true;
    } catch (MailException $e) {
        error_log('PHPMailer error to ' . $to . ': ' . $e->getMessage());
        return false;
    }
}
