package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Produit;
import tn.esprit.backend.service.ProduitService;
import tn.esprit.backend.dto.ProduitDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin("*")
public class ProduitController {

    @Autowired
    private ProduitService service;

    @GetMapping
    public List<ProduitDTO> getAll() {
        return service.getAll().stream()
                .map(ProduitDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitDTO> getById(@PathVariable Long id) {
        Produit obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(ProduitDTO.fromEntity(obj)) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ProduitDTO create(@RequestBody Produit obj) {
        Produit created = service.create(obj);
        return ProduitDTO.fromEntity(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProduitDTO> update(@PathVariable Long id, @RequestBody Produit obj) {
        Produit updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(ProduitDTO.fromEntity(updated)) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
