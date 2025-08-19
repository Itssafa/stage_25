package tn.esprit.backend.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    /**
     * Simule l'envoi d'un SMS avec un code de vérification
     * En production, ceci devrait utiliser un service SMS réel comme Twilio, AWS SNS, etc.
     * 
     * @param telephone Le numéro de téléphone de destination
     * @param code Le code de vérification à envoyer
     * @return true si l'envoi a réussi, false sinon
     */
    public boolean sendSms(String telephone, String code) {
        try {
            // Simulation de l'envoi SMS
            logger.info("📱 SMS simulé envoyé au {} : Code de vérification: {}", telephone, code);
            
            // Simuler un délai d'envoi
            Thread.sleep(500);
            
            // En développement, on simule toujours un succès
            return true;
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi du SMS au {} : {}", telephone, e.getMessage());
            return false;
        }
    }

    /**
     * Méthode pour intégrer un vrai service SMS (Twilio par exemple)
     * Décommentez et configurez selon votre fournisseur SMS
     */
    /*
    public boolean sendRealSms(String telephone, String code) {
        try {
            // Exemple avec Twilio (nécessite les dépendances Twilio)
            // Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
            // Message message = Message.creator(
            //         new PhoneNumber(telephone),
            //         new PhoneNumber(TWILIO_PHONE_NUMBER),
            //         "Votre code de vérification ProdLine: " + code
            // ).create();
            // 
            // logger.info("SMS envoyé avec succès. SID: {}", message.getSid());
            // return true;
            
            return false;
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi du SMS : {}", e.getMessage());
            return false;
        }
    }
    */
}