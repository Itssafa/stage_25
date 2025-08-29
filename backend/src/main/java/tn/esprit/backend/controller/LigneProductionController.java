package tn.esprit.backend.controller;

import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.service.LigneProductionService;
import tn.esprit.backend.service.UserService;
import tn.esprit.backend.dto.LigneProductionSimpleDTO;
import tn.esprit.backend.dto.LigneProductionDTO;
import tn.esprit.backend.dto.LigneProductionCreateDTO;
import tn.esprit.backend.annotation.RequireRole;
import tn.esprit.backend.annotation.RequireLoginCapability;
import tn.esprit.backend.enums.Role;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private UserService userService;

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
    public ResponseEntity<LigneProductionDTO> create(@RequestBody LigneProductionCreateDTO createDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username);
            
            if (currentUser == null) {
                return ResponseEntity.badRequest().build();
            }

            LigneProduction ligne = new LigneProduction();
            ligne.setNom(createDTO.getNom());
            ligne.setUser(currentUser);
            
            LigneProduction savedLigne = service.createWithPostes(ligne, createDTO.getPosteIds());
            return ResponseEntity.ok(LigneProductionDTO.fromEntity(savedLigne));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public ResponseEntity<LigneProductionDTO> update(@PathVariable Long id, @RequestBody LigneProductionCreateDTO updateDTO) {
        try {
            LigneProduction ligne = new LigneProduction();
            ligne.setNom(updateDTO.getNom());
            
            LigneProduction updated = service.updateWithPostes(id, ligne, updateDTO.getPosteIds());
            if (updated != null) {
                return ResponseEntity.ok(LigneProductionDTO.fromEntity(updated));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @RequireRole({Role.ADMIN, Role.PARAMETREUR})
    @RequireLoginCapability
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
