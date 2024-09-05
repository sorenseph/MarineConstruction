<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recoger los datos del formulario
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    // Configuración del correo electrónico
    $to = "israelcardenas6@gmail.com"; // Cambia esto a tu dirección de correo electrónico
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Enviar el correo electrónico
    $mail_sent = mail($to, $subject, $message, $headers);

    // Verificar si el correo se envió correctamente
    if ($mail_sent) {
        echo "Your message has been sent. Thank you!";
    } else {
        echo "There was a problem sending your message. Please try again.";
    }
} else {
    echo "Invalid request.";
}
?>
