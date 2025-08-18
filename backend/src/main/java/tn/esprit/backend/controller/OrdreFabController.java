package tn.esprit.backend.controller;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.entity.Produit;
import tn.esprit.backend.entity.StatutOrdre;
import tn.esprit.backend.service.OrdreFabService;
import tn.esprit.backend.service.UserService;
import tn.esprit.backend.service.ProduitService;
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

    @Autowired
    private UserService userService;

    @Autowired
    private ProduitService produitService;

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
    public ResponseEntity<OrdreFab> create(@RequestBody OrdreFab obj) {
        // Valider et récupérer l'utilisateur
        if (obj.getUser() != null && obj.getUser().getMatricule() != null) {
            User user = userService.getById(obj.getUser().getMatricule());
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setUser(user);
        }
        
        // Valider et récupérer le produit
        if (obj.getProduit() != null && obj.getProduit().getIdProduit() != null) {
            Produit produit = produitService.getById(obj.getProduit().getIdProduit());
            if (produit == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setProduit(produit);
        }
        
        OrdreFab created = service.create(obj);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdreFab> update(@PathVariable Long id, @RequestBody OrdreFab obj) {
        // Valider et récupérer l'utilisateur
        if (obj.getUser() != null && obj.getUser().getMatricule() != null) {
            User user = userService.getById(obj.getUser().getMatricule());
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setUser(user);
        }
        
        // Valider et récupérer le produit
        if (obj.getProduit() != null && obj.getProduit().getIdProduit() != null) {
            Produit produit = produitService.getById(obj.getProduit().getIdProduit());
            if (produit == null) {
                return ResponseEntity.badRequest().build();
            }
            obj.setProduit(produit);
        }
        
        OrdreFab updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/statuts")
    public StatutOrdre[] getStatuts() {
        return StatutOrdre.values();
    }
}
