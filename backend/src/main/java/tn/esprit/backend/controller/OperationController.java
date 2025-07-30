package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Operation;
import tn.esprit.backend.service.OperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin("*")
public class OperationController {

    @Autowired
    private OperationService service;

    @GetMapping
    public List<Operation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operation> getById(@PathVariable Long id) {
        Operation obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Operation create(@RequestBody Operation obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operation> update(@PathVariable Long id, @RequestBody Operation obj) {
        Operation updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
