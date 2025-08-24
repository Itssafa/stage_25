package tn.esprit.backend.service;

import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.entity.Application;
import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.entity.EtatPoste;
import tn.esprit.backend.repository.AffectationRepository;
import tn.esprit.backend.repository.ApplicationRepository;
import tn.esprit.backend.repository.PosteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AffectationService {

    @Autowired
    private AffectationRepository repository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private PosteRepository posteRepository;

    public List<Affectation> getAll() {
        return repository.findAll();
    }

    public Affectation getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Affectation create(Affectation obj) {
        return repository.save(obj);
    }

    public Affectation update(Long id, Affectation updated) {
        Affectation existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre a jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
    
    // Méthodes spécialisées pour la gestion des affectations
    
    /**
     * Affecter une application à un poste
     * @param applicationId ID de l'application
     * @param posteId ID du poste
     * @return L'affectation créée ou null si impossible
     */
    public Affectation affecterApplication(Long applicationId, Long posteId) {
        // Vérifier si l'application existe
        Application application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) return null;
        
        // Vérifier si le poste existe
        Poste poste = posteRepository.findById(posteId).orElse(null);
        if (poste == null) return null;
        
        // Nettoyer les anciens doublons pour cette application
        cleanupDuplicateActiveAffectations(applicationId, posteId);
        
        // Vérifier si l'application est déjà affectée ailleurs (après nettoyage)
        Optional<Affectation> currentAppAffectation = repository.findFirstByApplicationIdAppAndActiveTrueOrderByDateDebutDesc(applicationId);
        if (currentAppAffectation.isPresent()) {
            return null; // Application déjà affectée
        }
        
        // Vérifier si le poste a déjà une application affectée (après nettoyage)
        Optional<Affectation> currentPosteAffectation = repository.findFirstByPosteIdPosteAndActiveTrueOrderByDateDebutDesc(posteId);
        if (currentPosteAffectation.isPresent()) {
            return null; // Poste déjà configuré
        }
        
        // Créer la nouvelle affectation
        Affectation affectation = new Affectation(poste, application);
        Affectation savedAffectation = repository.save(affectation);
        
        // Mettre à jour l'état du poste à "configuré"
        if (savedAffectation != null) {
            poste.setEtat(EtatPoste.CONFIGURE);
            posteRepository.save(poste);
        }
        
        return savedAffectation;
    }
    
    /**
     * Désaffecter une application d'un poste
     * @param applicationId ID de l'application
     * @return true si désaffectée avec succès, false sinon
     */
    public boolean desaffecterApplication(Long applicationId) {
        Optional<Affectation> currentAffectation = repository.findFirstByApplicationIdAppAndActiveTrueOrderByDateDebutDesc(applicationId);
        if (!currentAffectation.isPresent()) {
            return false; // Application pas affectée
        }
        
        Affectation affectation = currentAffectation.get();
        Poste poste = affectation.getPoste();
        
        // Désactiver l'affectation
        affectation.setActive(false);
        affectation.setDateFin(LocalDateTime.now());
        repository.save(affectation);
        
        // Mettre à jour l'état du poste à "non configuré"
        if (poste != null) {
            poste.setEtat(EtatPoste.NON_CONFIGURE);
            posteRepository.save(poste);
        }
        
        return true;
    }
    
    /**
     * Vérifier si une application est actuellement affectée
     */
    public boolean isApplicationAffected(Long applicationId) {
        return repository.findFirstByApplicationIdAppAndActiveTrueOrderByDateDebutDesc(applicationId).isPresent();
    }
    
    /**
     * Vérifier si un poste est actuellement configuré
     */
    public boolean isPosteConfigured(Long posteId) {
        return repository.findFirstByPosteIdPosteAndActiveTrueOrderByDateDebutDesc(posteId).isPresent();
    }
    
    /**
     * Obtenir l'affectation active d'une application
     */
    public Optional<Affectation> getActiveAffectationForApplication(Long applicationId) {
        return repository.findFirstByApplicationIdAppAndActiveTrueOrderByDateDebutDesc(applicationId);
    }
    
    /**
     * Obtenir l'affectation active d'un poste
     */
    public Optional<Affectation> getActiveAffectationForPoste(Long posteId) {
        return repository.findFirstByPosteIdPosteAndActiveTrueOrderByDateDebutDesc(posteId);
    }
    
    /**
     * Obtenir l'historique des affectations d'une application
     */
    public List<Affectation> getHistoriqueApplication(Long applicationId) {
        return repository.findByApplicationIdAppOrderByDateDebutDesc(applicationId);
    }
    
    /**
     * Obtenir l'historique des affectations d'un poste
     */
    public List<Affectation> getHistoriquePoste(Long posteId) {
        return repository.findByPosteIdPosteOrderByDateDebutDesc(posteId);
    }
    
    /**
     * Nettoyer les doublons d'affectations actives
     * Cette méthode désactive les anciens doublons en gardant seulement le plus récent
     */
    private void cleanupDuplicateActiveAffectations(Long applicationId, Long posteId) {
        // Nettoyer les doublons pour l'application
        List<Affectation> appAffectations = repository.findByApplicationIdAppAndActiveTrue(applicationId);
        if (appAffectations.size() > 1) {
            // Trier par date décroissante et désactiver tous sauf le premier
            appAffectations.sort((a1, a2) -> a2.getDateDebut().compareTo(a1.getDateDebut()));
            for (int i = 1; i < appAffectations.size(); i++) {
                Affectation duplicate = appAffectations.get(i);
                duplicate.setActive(false);
                duplicate.setDateFin(LocalDateTime.now());
                repository.save(duplicate);
            }
        }
        
        // Nettoyer les doublons pour le poste
        List<Affectation> posteAffectations = repository.findByPosteIdPosteAndActiveTrue(posteId);
        if (posteAffectations.size() > 1) {
            // Trier par date décroissante et désactiver tous sauf le premier
            posteAffectations.sort((a1, a2) -> a2.getDateDebut().compareTo(a1.getDateDebut()));
            for (int i = 1; i < posteAffectations.size(); i++) {
                Affectation duplicate = posteAffectations.get(i);
                duplicate.setActive(false);
                duplicate.setDateFin(LocalDateTime.now());
                repository.save(duplicate);
            }
        }
    }
}
