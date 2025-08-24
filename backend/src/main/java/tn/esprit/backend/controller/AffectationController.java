package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.entity.Application;
import tn.esprit.backend.service.AffectationService;
import tn.esprit.backend.service.PosteService;
import tn.esprit.backend.service.ApplicationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/affectations")
@CrossOrigin("*")
public class AffectationController {

    @Autowired
    private AffectationService affectationService;

    @Autowired
    private PosteService posteService;

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public List<Affectation> getAll() {
        return affectationService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Affectation> getById(@PathVariable Long id) {
        Affectation obj = affectationService.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    // Création explicite d'une affectation entre un poste et une application  
    @PostMapping
    public ResponseEntity<Affectation> create(@RequestParam Long posteId, @RequestParam Long appId) {
        Affectation affectation = affectationService.affecterApplication(appId, posteId);
        
        if (affectation == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(affectation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Affectation> update(@PathVariable Long id, @RequestBody Affectation obj) {
        Affectation updated = affectationService.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        affectationService.delete(id);
    }
    
    // Nouveaux endpoints pour la gestion des affectations
    
    /**
     * Affecter une application à un poste
     */
    @PostMapping("/affecter")
    public ResponseEntity<String> affecterApplication(@RequestParam Long applicationId, @RequestParam Long posteId) {
        Affectation affectation = affectationService.affecterApplication(applicationId, posteId);
        
        if (affectation == null) {
            return ResponseEntity.badRequest().body("Impossible d'affecter: Application déjà affectée ou poste déjà configuré");
        }
        
        return ResponseEntity.ok("Application affectée avec succès au poste");
    }
    
    /**
     * Désaffecter une application
     */
    @PostMapping("/desaffecter/{applicationId}")
    public ResponseEntity<String> desaffecterApplication(@PathVariable Long applicationId) {
        boolean success = affectationService.desaffecterApplication(applicationId);
        
        if (!success) {
            return ResponseEntity.badRequest().body("Application non affectée actuellement");
        }
        
        return ResponseEntity.ok("Application désaffectée avec succès");
    }
    
    /**
     * Vérifier si une application est affectée
     */
    @GetMapping("/application/{applicationId}/affected")
    public ResponseEntity<Boolean> isApplicationAffected(@PathVariable Long applicationId) {
        boolean affected = affectationService.isApplicationAffected(applicationId);
        return ResponseEntity.ok(affected);
    }
    
    /**
     * Vérifier si un poste est configuré
     */
    @GetMapping("/poste/{posteId}/configured")
    public ResponseEntity<Boolean> isPosteConfigured(@PathVariable Long posteId) {
        boolean configured = affectationService.isPosteConfigured(posteId);
        return ResponseEntity.ok(configured);
    }
    
    /**
     * Obtenir l'affectation active d'une application
     */
    @GetMapping("/application/{applicationId}/active")
    public ResponseEntity<Affectation> getActiveAffectationForApplication(@PathVariable Long applicationId) {
        Optional<Affectation> affectation = affectationService.getActiveAffectationForApplication(applicationId);
        return affectation.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtenir l'affectation active d'un poste
     */
    @GetMapping("/poste/{posteId}/active")
    public ResponseEntity<Affectation> getActiveAffectationForPoste(@PathVariable Long posteId) {
        Optional<Affectation> affectation = affectationService.getActiveAffectationForPoste(posteId);
        return affectation.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Obtenir l'historique des affectations d'une application
     */
    @GetMapping("/application/{applicationId}/historique")
    public ResponseEntity<List<Affectation>> getHistoriqueApplication(@PathVariable Long applicationId) {
        List<Affectation> historique = affectationService.getHistoriqueApplication(applicationId);
        return ResponseEntity.ok(historique);
    }
    
    /**
     * Obtenir l'historique des affectations d'un poste
     */
    @GetMapping("/poste/{posteId}/historique")
    public ResponseEntity<List<Affectation>> getHistoriquePoste(@PathVariable Long posteId) {
        List<Affectation> historique = affectationService.getHistoriquePoste(posteId);
        return ResponseEntity.ok(historique);
    }
}
