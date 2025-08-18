package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Application;
import tn.esprit.backend.entity.Operation;
import tn.esprit.backend.service.ApplicationService;
import tn.esprit.backend.service.OperationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin("*")
public class ApplicationController {

    @Autowired
    private ApplicationService service;

    @Autowired
    private OperationService operationService;

    @GetMapping
    public List<Application> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getById(@PathVariable Long id) {
        Application obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Application> create(@RequestBody Application obj) {
        // Si une opération est spécifiée, la récupérer depuis la base
        if (obj.getOperation() != null && obj.getOperation().getId() != null) {
            Operation operation = operationService.getById(obj.getOperation().getId());
            if (operation == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setOperation(operation);
        }
        
        Application created = service.create(obj);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> update(@PathVariable Long id, @RequestBody Application obj) {
        // Si une opération est spécifiée, la récupérer depuis la base
        if (obj.getOperation() != null && obj.getOperation().getId() != null) {
            Operation operation = operationService.getById(obj.getOperation().getId());
            if (operation == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setOperation(operation);
        }
        
        Application updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
