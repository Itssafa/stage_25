package tn.esprit.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class SmsVerificationService {

    @Autowired
    private SmsService smsService;

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
    public String generateAndStoreCode(String telephone) {
        // Générer un code à 6 chiffres
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));

        // Stocker le code avec une expiration de 10 minutes
        LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(10);
        verificationCodes.put(telephone, new VerificationData(code, expirationTime));

        // Nettoyer les codes expirés (simple nettoyage)
        cleanExpiredCodes();

        return code;
    }

    /**
     * Envoie le code de vérification par SMS
     */
    public void sendSmsVerification(String telephone, String code) {
        boolean sent = smsService.sendSms(telephone, code);
        
        if (!sent) {
            throw new RuntimeException("Erreur lors de l'envoi du SMS de vérification");
        }
        
        System.out.println("✅ SMS de vérification envoyé avec succès au: " + telephone);
    }

    /**
     * Vérifie si le code fourni est correct et non expiré
     */
    public boolean verifyCode(String telephone, String providedCode) {
        VerificationData data = verificationCodes.get(telephone);

        if (data == null) {
            return false; // Aucun code trouvé pour ce téléphone
        }

        if (LocalDateTime.now().isAfter(data.expirationTime)) {
            verificationCodes.remove(telephone); // Supprimer le code expiré
            return false; // Code expiré
        }

        if (data.code.equals(providedCode)) {
            verificationCodes.remove(telephone); // Supprimer le code utilisé
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
     * Vérifie si un téléphone a un code de vérification valide en attente
     */
    public boolean hasValidCode(String telephone) {
        VerificationData data = verificationCodes.get(telephone);
        if (data == null) {
            return false;
        }
        return LocalDateTime.now().isBefore(data.expirationTime);
    }

    /**
     * Supprime le code de vérification pour un téléphone donné
     */
    public void removeCode(String telephone) {
        verificationCodes.remove(telephone);
    }
}