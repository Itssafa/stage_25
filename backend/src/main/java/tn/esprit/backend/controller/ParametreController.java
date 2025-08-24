package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Parametre;
import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.service.ParametreService;
import tn.esprit.backend.service.AffectationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parametres")
@CrossOrigin("*")
public class ParametreController {

    @Autowired
    private ParametreService service;

    @Autowired
    private AffectationService affectationService;

    @GetMapping
    public List<Parametre> getAll(@RequestParam(required = false) Long affectationId) {
        if (affectationId != null) {
            return service.getByAffectationId(affectationId);
        }
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parametre> getById(@PathVariable Long id) {
        Parametre obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Parametre> create(@RequestBody Parametre obj) {
        // Valider et récupérer l'affectation
        if (obj.getAffectation() != null && obj.getAffectation().getIdAffectation() != null) {
            Affectation affectation = affectationService.getById(obj.getAffectation().getIdAffectation());
            if (affectation == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setAffectation(affectation);
        }
        
        Parametre created = service.create(obj);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parametre> update(@PathVariable Long id, @RequestBody Parametre obj) {
        // Valider et récupérer l'affectation
        if (obj.getAffectation() != null && obj.getAffectation().getIdAffectation() != null) {
            Affectation affectation = affectationService.getById(obj.getAffectation().getIdAffectation());
            if (affectation == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setAffectation(affectation);
        }
        
        Parametre updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
