package tn.esprit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.service.EmailVerificationService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class EmailVerificationController {

    @Autowired
    private EmailVerificationService emailVerificationService;

    @PostMapping("/send-verification-code")
    public ResponseEntity<Map<String, Object>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Email est requis");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String verificationCode = emailVerificationService.generateAndStoreCode(email);
            emailVerificationService.sendVerificationEmail(email, verificationCode);

            response.put("success", true);
            response.put("message", "Code de vérification envoyé avec succès");
            // En développement, on peut retourner le code (à supprimer en production)
            response.put("code", verificationCode);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi du code de vérification");
            return ResponseEntity.badRequest().body(response);
        }
    }

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
}