package tn.esprit.backend.service;

import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.entity.Application;
import tn.esprit.backend.entity.Poste;
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
        
        // Vérifier si l'application est déjà affectée ailleurs
        Optional<Affectation> currentAppAffectation = repository.findByApplicationIdAppAndActiveTrue(applicationId);
        if (currentAppAffectation.isPresent()) {
            return null; // Application déjà affectée
        }
        
        // Vérifier si le poste a déjà une application affectée
        Optional<Affectation> currentPosteAffectation = repository.findByPosteIdPosteAndActiveTrue(posteId);
        if (currentPosteAffectation.isPresent()) {
            return null; // Poste déjà configuré
        }
        
        // Créer la nouvelle affectation
        Affectation affectation = new Affectation(poste, application);
        return repository.save(affectation);
    }
    
    /**
     * Désaffecter une application d'un poste
     * @param applicationId ID de l'application
     * @return true si désaffectée avec succès, false sinon
     */
    public boolean desaffecterApplication(Long applicationId) {
        Optional<Affectation> currentAffectation = repository.findByApplicationIdAppAndActiveTrue(applicationId);
        if (!currentAffectation.isPresent()) {
            return false; // Application pas affectée
        }
        
        Affectation affectation = currentAffectation.get();
        affectation.setActive(false);
        affectation.setDateFin(LocalDateTime.now());
        repository.save(affectation);
        
        return true;
    }
    
    /**
     * Vérifier si une application est actuellement affectée
     */
    public boolean isApplicationAffected(Long applicationId) {
        return repository.findByApplicationIdAppAndActiveTrue(applicationId).isPresent();
    }
    
    /**
     * Vérifier si un poste est actuellement configuré
     */
    public boolean isPosteConfigured(Long posteId) {
        return repository.findByPosteIdPosteAndActiveTrue(posteId).isPresent();
    }
    
    /**
     * Obtenir l'affectation active d'une application
     */
    public Optional<Affectation> getActiveAffectationForApplication(Long applicationId) {
        return repository.findByApplicationIdAppAndActiveTrue(applicationId);
    }
    
    /**
     * Obtenir l'affectation active d'un poste
     */
    public Optional<Affectation> getActiveAffectationForPoste(Long posteId) {
        return repository.findByPosteIdPosteAndActiveTrue(posteId);
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
}
