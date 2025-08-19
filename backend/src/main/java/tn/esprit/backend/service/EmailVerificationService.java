package tn.esprit.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class EmailVerificationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Stockage temporaire des codes en mémoire (en production, utiliser Redis ou une base de données)
    private final Map<String, VerificationData> verificationCodes = new HashMap<>();

    // Classe interne pour stocker les données de vérification
    private static class VerificationData {
        String code;
        LocalDateTime expirationTime;

        VerificationData(String code, LocalDateTime expirationTime) {
            this.code = code;
            this.expirationTime = expirationTime;
        }
    }

    /**
     * Génère un code de vérification à 6 chiffres et le stocke temporairement
     */
    public String generateAndStoreCode(String email) {
        // Générer un code à 6 chiffres
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));

        // Stocker le code avec une expiration de 10 minutes
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(10);
        verificationCodes.put(email, new VerificationData(code, expirationTime));

        // Nettoyer les codes expirés (simple nettoyage)
        cleanExpiredCodes();

        return code;
    }

    /**
     * Envoie le code de vérification par email
     */
    public void sendVerificationEmail(String email, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("🔐 Code de vérification ProdLine");
            
            String htmlContent = 
                "<html>" +
                "<head>" +
                "    <style>" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; }" +
                "        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                "        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }" +
                "        .code { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #667eea; margin: 20px 0; letter-spacing: 5px; }" +
                "        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>🚀 ProdLine</h1>" +
                "            <p>Vérification de votre adresse email</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <h2>👋 Bonjour !</h2>" +
                "            <p>Vous avez demandé un code de vérification pour créer votre compte ProdLine.</p>" +
                "            <p>Voici votre code de vérification :</p>" +
                "            <div class='code'>" + code + "</div>" +
                "            <p><strong>⏰ Ce code expire dans 10 minutes.</strong></p>" +
                "            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>© 2024 ProdLine - Système de gestion de production</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            System.out.println("✅ Email de vérification envoyé avec succès à: " + email);
            
        } catch (MessagingException e) {
            System.err.println("❌ Erreur lors de l'envoi de l'email: " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }

    /**
     * Vérifie si le code fourni est correct et non expiré
     */
    public boolean verifyCode(String email, String providedCode) {
        VerificationData data = verificationCodes.get(email);

        if (data == null) {
            return false; // Aucun code trouvé pour cet email
        }

        if (LocalDateTime.now().isAfter(data.expirationTime)) {
            verificationCodes.remove(email); // Supprimer le code expiré
            return false; // Code expiré
        }

        if (data.code.equals(providedCode)) {
            verificationCodes.remove(email); // Supprimer le code utilisé
            return true; // Code correct
        }

        return false; // Code incorrect
    }

    /**
     * Nettoie les codes expirés
     */
    private void cleanExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        verificationCodes.entrySet().removeIf(entry -> 
            now.isAfter(entry.getValue().expirationTime)
        );
    }

    /**
     * Vérifie si un email a un code de vérification valide en attente
     */
    public boolean hasValidCode(String email) {
        VerificationData data = verificationCodes.get(email);
        if (data == null) {
            return false;
        }
        return LocalDateTime.now().isBefore(data.expirationTime);
    }

    /**
     * Supprime le code de vérification pour un email donné
     */
    public void removeCode(String email) {
        verificationCodes.remove(email);
    }
}