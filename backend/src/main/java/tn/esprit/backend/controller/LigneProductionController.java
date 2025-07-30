package tn.esprit.backend.controller;

import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.service.LigneProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ligneproductions")
@CrossOrigin("*")
public class LigneProductionController {

    @Autowired
    private LigneProductionService service;

    @GetMapping
    public List<LigneProduction> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LigneProduction> getById(@PathVariable Long id) {
        LigneProduction obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public LigneProduction create(@RequestBody LigneProduction obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneProduction> update(@PathVariable Long id, @RequestBody LigneProduction obj) {
        LigneProduction updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
