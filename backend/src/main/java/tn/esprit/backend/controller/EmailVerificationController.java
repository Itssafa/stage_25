package tn.esprit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import tn.esprit.backend.service.EmailVerificationService;
import tn.esprit.backend.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")


public class EmailVerificationController {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==============================
    // 🔹 ENVOI CODE PAR EMAIL
    // ==============================
    @PostMapping("/send-email-code")
    public ResponseEntity<Map<String, Object>> sendEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "L'adresse email est requise");
            return ResponseEntity.badRequest().body(response);
        }

        if (emailVerificationService.hasValidCode(email)) {
            response.put("success", false);
            response.put("message", "Un code a déjà été envoyé. Attendez avant de redemander.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String code = emailVerificationService.generateAndStoreCode(email);
            emailVerificationService.sendVerificationEmail(email, code);

            response.put("success", true);
            response.put("message", "Code de vérification envoyé par e-mail avec succès");
            // ⚠️ À retirer en production
            response.put("code", code);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi de l'email : " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ==============================
    // 🔹 VÉRIFICATION CODE EMAIL
    // ==============================
    @PostMapping("/verify-email-code")
    public ResponseEntity<Map<String, Object>> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();

        if (email == null || code == null) {
            response.put("success", false);
            response.put("message", "Email et code sont requis");
            return ResponseEntity.badRequest().body(response);
        }

        boolean isValid = emailVerificationService.verifyCode(email, code);

        if (isValid) {
            response.put("success", true);
            response.put("message", "Email vérifié avec succès");
        } else {
            response.put("success", false);
            response.put("message", "Code de vérification incorrect ou expiré");
        }

        return ResponseEntity.ok(response);
    }

    // ==============================
    // 🔹 ENVOI CODE DE RÉINITIALISATION PAR EMAIL
    // ==============================
    @PostMapping("/send-reset-code")
    public ResponseEntity<Map<String, Object>> sendResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "L'adresse email est requise");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            if (!userService.existsByEmail(email)) {
                response.put("success", false);
                response.put("message", "Aucun compte trouvé avec cette adresse email");
                return ResponseEntity.badRequest().body(response);
            }

            String resetCode = emailVerificationService.generateAndStoreCode(email);
            emailVerificationService.sendVerificationEmail(email, resetCode);

            response.put("success", true);
            response.put("message", "Code de récupération envoyé par email");
            // ⚠️ À retirer en production
            response.put("code", resetCode);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi du code de récupération: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // ==============================
    // 🔹 RÉINITIALISATION DU MOT DE PASSE
    // ==============================
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        Map<String, Object> response = new HashMap<>();

        if (email == null || code == null || newPassword == null) {
            response.put("success", false);
            response.put("message", "Tous les champs sont requis");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            boolean isValidCode = emailVerificationService.verifyCode(email, code);

            if (!isValidCode) {
                response.put("success", false);
                response.put("message", "Code de vérification incorrect ou expiré");
                return ResponseEntity.badRequest().body(response);
            }

            boolean passwordUpdated = userService.updatePasswordByEmail(email, passwordEncoder.encode(newPassword));

            if (passwordUpdated) {
                response.put("success", true);
                response.put("message", "Mot de passe réinitialisé avec succès");
            } else {
                response.put("success", false);
                response.put("message", "Erreur lors de la mise à jour du mot de passe");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la réinitialisation du mot de passe: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
@GetMapping("/test-email")
public ResponseEntity<String> testEmail() {
    try {
        // On utilise l’adresse configurée dans application.properties
        String testEmail = fromEmail;  // récupérée automatiquement via @Value
        String testCode = "123456";

        emailVerificationService.sendVerificationEmail(testEmail, testCode);

        return ResponseEntity.ok("✅ Email de test envoyé avec succès à : " + testEmail);
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .body("❌ Erreur lors de l'envoi : " + e.getMessage());
    }
}


}