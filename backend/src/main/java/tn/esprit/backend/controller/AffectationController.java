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
        Poste poste = posteService.getById(posteId);
        Application app = applicationService.getById(appId);

        if (poste == null || app == null) {
            return ResponseEntity.badRequest().build();
        }

        Affectation affectation = new Affectation(poste, app);
        Affectation created = affectationService.create(affectation);
        return ResponseEntity.ok(created);
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
}
