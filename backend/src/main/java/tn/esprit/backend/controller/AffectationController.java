package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.service.AffectationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@CrossOrigin("*")
public class AffectationController {

    @Autowired
    private AffectationService service;

    @GetMapping
    public List<Affectation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Affectation> getById(@PathVariable Long id) {
        Affectation obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Affectation create(@RequestBody Affectation obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Affectation> update(@PathVariable Long id, @RequestBody Affectation obj) {
        Affectation updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
