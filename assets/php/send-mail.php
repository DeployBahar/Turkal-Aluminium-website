<?php
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$smtpUsername = '';
$smtpPassword = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8');
    $phone = htmlspecialchars($_POST['phone'], ENT_QUOTES, 'UTF-8');
    $subject = htmlspecialchars($_POST['subject'], ENT_QUOTES, 'UTF-8');
    $message = nl2br(htmlspecialchars($_POST['message'], ENT_QUOTES, 'UTF-8'));
    $userEmail = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);

    $mail = new PHPMailer(true);

    try {
        $mail->CharSet = 'UTF-8';
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUsername; 
        $mail->Password   = $smtpPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        if (filter_var($smtpUsername, FILTER_VALIDATE_EMAIL)) {
            $mail->setFrom($smtpUsername, 'Web Formu');
        } else {
            throw new Exception("Geçersiz gönderen e-posta adresi: $smtpUsername");
        }
        $mail->addAddress('');
        if ($userEmail) {
            $mail->addReplyTo($userEmail, $name);
        }

        // İçeriği HTML olarak hazırla
        $mail->isHTML(true);
        $mail->Subject = "Turkal Yeni İletişim Formu: $subject";
        $mail->Body    = "
            <h2>Yeni İletişim Formu</h2>
            <p><strong>Adı:</strong> $name</p>
            <p><strong>Telefon:</strong> $phone</p>
            <p><strong>Konu:</strong> $subject</p>
            <p><strong>Mesaj:</strong><br>$message</p>
        ";

        // Maili gönder
        if ($mail->send()) {
            header("Location: ../../index.html?success=1");
            exit();
        } else {
            echo "Mail gönderme başarısız.";
        }
    } catch (Exception $e) {
        echo "Mail gönderme hatası: {$e->getMessage()}";
    }
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
