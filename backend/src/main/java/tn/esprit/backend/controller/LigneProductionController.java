package tn.esprit.backend.controller;

import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.service.LigneProductionService;
import tn.esprit.backend.dto.LigneProductionSimpleDTO;
import tn.esprit.backend.dto.LigneProductionDTO;
import tn.esprit.backend.annotation.RequireRole;
import tn.esprit.backend.annotation.RequireLoginCapability;
import tn.esprit.backend.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ligneproductions")
@CrossOrigin("*")
public class LigneProductionController {

    @Autowired
    private LigneProductionService service;

    @GetMapping
    public List<LigneProductionDTO> getAll() {
        return service.getAll().stream()
                .map(LigneProductionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public ResponseEntity<LigneProduction> getById(@PathVariable Long id) {
        LigneProduction obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(obj) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public LigneProduction create(@RequestBody LigneProduction obj) {
        return service.create(obj);
    }

    @PutMapping("/{id}")
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public ResponseEntity<LigneProduction> update(@PathVariable Long id, @RequestBody LigneProduction obj) {
        LigneProduction updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
