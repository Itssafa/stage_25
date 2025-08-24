package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.entity.Application;
import tn.esprit.backend.entity.EtatPoste;
import tn.esprit.backend.service.PosteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/postes")
@CrossOrigin("*")
public class PosteController {

    @Autowired
    private PosteService service;

    @GetMapping
    public List<Poste> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poste> getById(@PathVariable Long id) {
        Poste obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Poste create(@RequestBody Poste obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Poste> update(@PathVariable Long id, @RequestBody Poste obj) {
        Poste updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // 🔥 Nouveau endpoint : récupérer toutes les applications d'un poste
    @GetMapping("/{id}/applications")
    public ResponseEntity<List<Application>> getApplicationsByPoste(@PathVariable Long id) {
        Poste poste = service.getById(id);
        if (poste == null) {
            return ResponseEntity.notFound().build();
        }

        List<Application> applications = poste.getAffectations()
                                             .stream()
                                             .map(aff -> aff.getApplication())
                                             .collect(Collectors.toList());

        return ResponseEntity.ok(applications);
    }

    // 🔥 Nouveau endpoint : mettre à jour l'état d'un poste
    @PutMapping("/{id}/etat")
    public ResponseEntity<Poste> updateEtat(@PathVariable Long id, @RequestBody EtatRequest etatRequest) {
        Poste poste = service.getById(id);
        if (poste == null) {
            return ResponseEntity.notFound().build();
        }

        EtatPoste nouvelEtat = "configuré".equals(etatRequest.getEtat()) ? 
            EtatPoste.CONFIGURE : EtatPoste.NON_CONFIGURE;
        
        poste.setEtat(nouvelEtat);
        Poste updated = service.update(id, poste);
        
        return ResponseEntity.ok(updated);
    }

    // Classe interne pour la requête d'état
    public static class EtatRequest {
        private String etat;

        public String getEtat() {
            return etat;
        }

        public void setEtat(String etat) {
            this.etat = etat;
        }
    }
}
