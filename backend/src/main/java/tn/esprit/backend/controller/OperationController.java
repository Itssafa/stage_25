package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Operation;
import tn.esprit.backend.service.OperationService;
import tn.esprit.backend.dto.OperationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operations")
@CrossOrigin("*")
public class OperationController {

    @Autowired
    private OperationService service;

    @GetMapping
    public List<OperationDTO> getAll() {
        return service.getAll().stream()
                .map(OperationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperationDTO> getById(@PathVariable Long id) {
        Operation obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(OperationDTO.fromEntity(obj)) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public OperationDTO create(@RequestBody Operation obj) {
        Operation created = service.create(obj);
        return OperationDTO.fromEntity(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperationDTO> update(@PathVariable Long id, @RequestBody Operation obj) {
        Operation updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(OperationDTO.fromEntity(updated)) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
