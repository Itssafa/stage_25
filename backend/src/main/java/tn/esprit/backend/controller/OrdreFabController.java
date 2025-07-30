package tn.esprit.backend.controller;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.service.OrdreFabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordrefabs")
@CrossOrigin("*")
public class OrdreFabController {

    @Autowired
    private OrdreFabService service;

    @GetMapping
    public List<OrdreFab> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdreFab> getById(@PathVariable Long id) {
        OrdreFab obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public OrdreFab create(@RequestBody OrdreFab obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdreFab> update(@PathVariable Long id, @RequestBody OrdreFab obj) {
        OrdreFab updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
