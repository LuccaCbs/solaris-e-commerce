package com.luccavergara.solaris.ecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private final WebClient webClient;

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    public EmailService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.resend.com").build();
    }

    public void sendVerificationEmail(String toEmail, String firstname, String verificationUrl) {
        String subject = "Verifica tu cuenta en Solaris";
        String html = buildVerificationEmailHtml(firstname, verificationUrl);
        sendEmail(toEmail, subject, html);
    }

    private void sendEmail(String toEmail, String subject, String html) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY no configurada. No se enviará el email a {}", toEmail);
            return;
        }

        try {
            webClient.post()
                    .uri("/emails")
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "from", fromEmail,
                            "to", new String[]{toEmail},
                            "subject", subject,
                            "html", html
                    ))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Email de verificación enviado a {}", toEmail);
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildVerificationEmailHtml(String firstname, String verificationUrl) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">¡Bienvenido a Solaris, %s!</h2>
                    <p>Gracias por registrarte. Para activar tu cuenta, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            Verificar mi cuenta
                        </a>
                    </div>
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #2563eb;">%s</p>
                    <p>Este enlace expirará en 24 horas.</p>
                    <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="color: #9ca3af; font-size: 12px;">Solaris E-Commerce</p>
                </div>
                """.formatted(firstname, verificationUrl, verificationUrl);
    }
}
