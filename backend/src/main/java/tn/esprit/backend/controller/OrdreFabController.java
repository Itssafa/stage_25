package tn.esprit.backend.controller;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.entity.Produit;
import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.entity.StatutOrdre;
import tn.esprit.backend.service.OrdreFabService;
import tn.esprit.backend.service.UserService;
import tn.esprit.backend.service.ProduitService;
import tn.esprit.backend.service.LigneProductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    @Autowired
    private LigneProductionService ligneProductionService;

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
        try {
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

            // Valider et récupérer la ligne de production
            if (obj.getLigneProduction() != null && obj.getLigneProduction().getIdLigne() != null) {
                LigneProduction ligne = ligneProductionService.getById(obj.getLigneProduction().getIdLigne());
                if (ligne == null) {
                    return ResponseEntity.badRequest().build();
                }
                obj.setLigneProduction(ligne);
            }
            
            OrdreFab created = service.create(obj);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdreFab> update(@PathVariable Long id, @RequestBody OrdreFab obj) {
        try {
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

            // Valider et récupérer la ligne de production
            if (obj.getLigneProduction() != null && obj.getLigneProduction().getIdLigne() != null) {
                LigneProduction ligne = ligneProductionService.getById(obj.getLigneProduction().getIdLigne());
                if (ligne == null) {
                    return ResponseEntity.badRequest().build();
                }
                obj.setLigneProduction(ligne);
            }
            
            OrdreFab updated = service.update(id, obj);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/statuts")
    public StatutOrdre[] getStatuts() {
        return StatutOrdre.values();
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkLigneAvailability(
            @RequestParam Long ligneId,
            @RequestParam String dateDebut,
            @RequestParam String dateFin,
            @RequestParam(required = false) Long excludeOrderId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            LocalDate debut = LocalDate.parse(dateDebut);
            LocalDate fin = LocalDate.parse(dateFin);
            
            boolean available = service.isLigneAvailable(ligneId, debut, fin, excludeOrderId);
            List<OrdreFab> conflictingOrders = service.getConflictingOrders(ligneId, debut, fin, excludeOrderId);
            
            response.put("available", available);
            response.put("conflictingOrders", conflictingOrders);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("available", false);
            response.put("error", "Erreur lors de la vérification de disponibilité");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            OrdreFab cancelled = service.cancelOrder(id);
            if (cancelled != null) {
                response.put("success", true);
                response.put("ordre", cancelled);
                response.put("message", "Ordre annulé avec succès");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("error", "Ordre non trouvé");
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/start-today")
    public ResponseEntity<Map<String, Object>> startOrderToday(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> result = service.startOrderToday(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/next-available-date")
    public ResponseEntity<Map<String, Object>> getNextAvailableDate(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            OrdreFab ordre = service.getById(id);
            if (ordre == null) {
                response.put("error", "Ordre non trouvé");
                return ResponseEntity.notFound().build();
            }

            long durationDays = ordre.getDatefin().toEpochDay() - ordre.getDatedeb().toEpochDay();
            LocalDate nextAvailableDate = service.findNextAvailableDate(
                ordre.getLigneProduction().getIdLigne(), 
                durationDays, 
                id
            );
            
            response.put("nextAvailableDate", nextAvailableDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Erreur lors de la recherche de la prochaine date disponible");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/start-on-date")
    public ResponseEntity<Map<String, Object>> startOrderOnDate(@PathVariable Long id, @RequestParam String newStartDate) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            LocalDate startDate = LocalDate.parse(newStartDate);
            Map<String, Object> result = service.startOrderOnDate(id, startDate);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

}
