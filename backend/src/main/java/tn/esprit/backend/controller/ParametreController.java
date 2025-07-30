package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Parametre;
import tn.esprit.backend.service.ParametreService;
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

    @GetMapping
    public List<Parametre> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Parametre> getById(@PathVariable Long id) {
        Parametre obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Parametre create(@RequestBody Parametre obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Parametre> update(@PathVariable Long id, @RequestBody Parametre obj) {
        Parametre updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
