package tn.esprit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.service.EmailVerificationService;
import tn.esprit.backend.service.SmsVerificationService;
import tn.esprit.backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class EmailVerificationController {

    @Autowired
    private EmailVerificationService emailVerificationService;
    
    @Autowired
    private SmsVerificationService smsVerificationService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/send-sms-code")
    public ResponseEntity<Map<String, Object>> sendSmsCode(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        Map<String, Object> response = new HashMap<>();

        if (telephone == null || telephone.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Numéro de téléphone est requis");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String verificationCode = smsVerificationService.generateAndStoreCode(telephone);
            smsVerificationService.sendSmsVerification(telephone, verificationCode);

            response.put("success", true);
            response.put("message", "Code de vérification envoyé par SMS avec succès");
            // En développement, on peut retourner le code (à supprimer en production)
            response.put("code", verificationCode);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi du code SMS");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/verify-sms-code")
    public ResponseEntity<Map<String, Object>> verifySmsCode(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        String code = request.get("code");
        Map<String, Object> response = new HashMap<>();

        if (telephone == null || code == null) {
            response.put("success", false);
            response.put("message", "Téléphone et code sont requis");
            return ResponseEntity.badRequest().body(response);
        }

        boolean isValid = smsVerificationService.verifyCode(telephone, code);

        if (isValid) {
            response.put("success", true);
            response.put("message", "Téléphone vérifié avec succès");
        } else {
            response.put("success", false);
            response.put("message", "Code de vérification incorrect ou expiré");
        }

        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/send-reset-code")
    public ResponseEntity<Map<String, Object>> sendResetCode(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        Map<String, Object> response = new HashMap<>();

        if (telephone == null || telephone.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Numéro de téléphone est requis");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Vérifier si l'utilisateur existe avec ce numéro de téléphone
            if (!userService.existsByTelephone(telephone)) {
                response.put("success", false);
                response.put("message", "Aucun compte trouvé avec ce numéro de téléphone");
                return ResponseEntity.badRequest().body(response);
            }
            
            String resetCode = smsVerificationService.generateAndStoreCode(telephone);
            smsVerificationService.sendSmsVerification(telephone, resetCode);

            response.put("success", true);
            response.put("message", "Code de récupération envoyé par SMS");
            // En développement, on peut retourner le code (à supprimer en production)
            response.put("code", resetCode);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de l'envoi du code de récupération");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String telephone = request.get("telephone");
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        Map<String, Object> response = new HashMap<>();

        if (telephone == null || code == null || newPassword == null) {
            response.put("success", false);
            response.put("message", "Tous les champs sont requis");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Vérifier le code
            boolean isValidCode = smsVerificationService.verifyCode(telephone, code);
            
            if (!isValidCode) {
                response.put("success", false);
                response.put("message", "Code de vérification incorrect ou expiré");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Mettre à jour le mot de passe
            boolean passwordUpdated = userService.updatePasswordByTelephone(telephone, passwordEncoder.encode(newPassword));
            
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
            response.put("message", "Erreur lors de la réinitialisation du mot de passe");
            return ResponseEntity.badRequest().body(response);
        }
    }
}