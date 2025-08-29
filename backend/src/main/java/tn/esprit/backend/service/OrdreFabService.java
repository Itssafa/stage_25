package tn.esprit.backend.service;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.entity.StatutOrdre;
import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.repository.OrdreFabRepository;
import tn.esprit.backend.repository.LigneProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;

@Service
public class OrdreFabService {

    @Autowired
    private OrdreFabRepository repository;

    @Autowired
    private LigneProductionRepository ligneProductionRepository;

    public List<OrdreFab> getAll() {
        return repository.findAll();
    }

    public OrdreFab getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public OrdreFab create(OrdreFab obj) {
        // S'assurer que le statut par défaut est EN_ATTENTE si non défini
        if (obj.getStatuts() == null) {
            obj.setStatuts(StatutOrdre.EN_ATTENTE);
        }

        // Valider la disponibilité de la ligne de production
        if (obj.getLigneProduction() != null) {
            validateLigneAvailability(obj.getLigneProduction(), obj.getDatedeb(), obj.getDatefin(), null);
        }

        return repository.save(obj);
    }

    public OrdreFab update(Long id, OrdreFab updated) {
        OrdreFab existing = repository.findById(id).orElse(null);
        if (existing == null) return null;

        // Valider la disponibilité de la ligne de production si elle a changé
        if (updated.getLigneProduction() != null && 
            (!updated.getLigneProduction().equals(existing.getLigneProduction()) ||
             !updated.getDatedeb().equals(existing.getDatedeb()) ||
             !updated.getDatefin().equals(existing.getDatefin()))) {
            validateLigneAvailability(updated.getLigneProduction(), updated.getDatedeb(), updated.getDatefin(), id);
        }
        
        existing.setCode_fab(updated.getCode_fab());
        existing.setStatuts(updated.getStatuts());
        existing.setQuantite(updated.getQuantite());
        existing.setDatedeb(updated.getDatedeb());
        existing.setDatefin(updated.getDatefin());
        // Ne pas modifier l'utilisateur lors des mises à jour pour préserver le créateur
        if (updated.getUser() != null && existing.getUser() == null) {
            existing.setUser(updated.getUser());
        }
        existing.setProduit(updated.getProduit());
        existing.setLigneProduction(updated.getLigneProduction());
        
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    /**
     * Valide la disponibilité d'une ligne de production pour une période donnée
     */
    public void validateLigneAvailability(LigneProduction ligne, LocalDate dateDebut, LocalDate dateFin, Long excludeOrderId) {
        List<StatutOrdre> excludedStatuts = Arrays.asList(StatutOrdre.ANNULEE, StatutOrdre.TERMINEE);
        
        List<OrdreFab> conflictingOrders;
        if (excludeOrderId != null) {
            // Pour la modification, exclure l'ordre actuel
            conflictingOrders = repository.findConflictingOrdersExcludingCurrent(
                ligne, dateDebut, dateFin, excludedStatuts, excludeOrderId);
        } else {
            // Pour la création
            conflictingOrders = repository.findConflictingOrders(
                ligne, dateDebut, dateFin, excludedStatuts);
        }

        if (!conflictingOrders.isEmpty()) {
            StringBuilder errorMessage = new StringBuilder();
            errorMessage.append("La ligne de production '").append(ligne.getNom())
                       .append("' n'est pas disponible pour la période du ")
                       .append(dateDebut).append(" au ").append(dateFin)
                       .append(". Conflits détectés avec les ordres suivants: ");
            
            for (int i = 0; i < conflictingOrders.size(); i++) {
                OrdreFab conflictingOrder = conflictingOrders.get(i);
                if (i > 0) errorMessage.append(", ");
                errorMessage.append("Ordre ").append(conflictingOrder.getCode_fab())
                           .append(" (").append(conflictingOrder.getDatedeb())
                           .append(" - ").append(conflictingOrder.getDatefin()).append(")");
            }
            
            throw new RuntimeException(errorMessage.toString());
        }
    }

    /**
     * Vérifie la disponibilité d'une ligne sans lever d'exception
     */
    public boolean isLigneAvailable(Long ligneId, LocalDate dateDebut, LocalDate dateFin, Long excludeOrderId) {
        try {
            LigneProduction ligne = ligneProductionRepository.findById(ligneId).orElse(null);
            if (ligne == null) {
                return false;
            }
            validateLigneAvailability(ligne, dateDebut, dateFin, excludeOrderId);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    /**
     * Récupère les ordres en conflit pour affichage côté frontend
     */
    public List<OrdreFab> getConflictingOrders(Long ligneId, LocalDate dateDebut, LocalDate dateFin, Long excludeOrderId) {
        LigneProduction ligne = ligneProductionRepository.findById(ligneId).orElse(null);
        if (ligne == null) {
            return List.of();
        }

        List<StatutOrdre> excludedStatuts = Arrays.asList(StatutOrdre.ANNULEE, StatutOrdre.TERMINEE);
        
        if (excludeOrderId != null) {
            return repository.findConflictingOrdersExcludingCurrent(
                ligne, dateDebut, dateFin, excludedStatuts, excludeOrderId);
        } else {
            return repository.findConflictingOrders(
                ligne, dateDebut, dateFin, excludedStatuts);
        }
    }

    public OrdreFab cancelOrder(Long id) {
        OrdreFab ordre = repository.findById(id).orElse(null);
        if (ordre == null) {
            throw new RuntimeException("Ordre de fabrication non trouvé");
        }

        if (!ordre.getStatuts().equals(StatutOrdre.EN_ATTENTE)) {
            throw new RuntimeException("Seuls les ordres en attente peuvent être annulés");
        }

        ordre.setStatuts(StatutOrdre.ANNULEE);
        return repository.save(ordre);
    }

    public Map<String, Object> startOrderToday(Long id) {
        Map<String, Object> result = new HashMap<>();
        
        OrdreFab ordre = repository.findById(id).orElse(null);
        if (ordre == null) {
            throw new RuntimeException("Ordre de fabrication non trouvé");
        }

        if (!ordre.getStatuts().equals(StatutOrdre.EN_ATTENTE)) {
            throw new RuntimeException("Seuls les ordres en attente peuvent être démarrés");
        }

        if (ordre.getLigneProduction() == null) {
            throw new RuntimeException("Aucune ligne de production assignée à cet ordre");
        }

        LocalDate today = LocalDate.now();
        
        // Calculer la nouvelle date de fin en gardant la même durée
        long durationDays = ordre.getDatefin().toEpochDay() - ordre.getDatedeb().toEpochDay();
        LocalDate newEndDate = today.plusDays(durationDays);
        
        // Vérifier si la ligne est disponible aujourd'hui
        if (isLigneAvailable(ordre.getLigneProduction().getIdLigne(), today, newEndDate, id)) {
            // La ligne est disponible aujourd'hui
            ordre.setDatedeb(today);
            ordre.setDatefin(newEndDate);
            ordre.setStatuts(StatutOrdre.EN_COURS);
            OrdreFab updated = repository.save(ordre);
            
            result.put("success", true);
            result.put("ordre", updated);
            result.put("message", "Ordre démarré avec succès aujourd'hui");
        } else {
            // Trouver la prochaine date disponible
            LocalDate nextAvailableDate = findNextAvailableDate(
                ordre.getLigneProduction().getIdLigne(), 
                durationDays,
                id
            );
            
            result.put("success", false);
            result.put("needsNewDate", true);
            result.put("nextAvailableDate", nextAvailableDate);
            result.put("message", "La ligne n'est pas disponible aujourd'hui. Prochaine date disponible: " + nextAvailableDate);
        }
        
        return result;
    }

    public Map<String, Object> startOrderOnDate(Long id, LocalDate newStartDate) {
        Map<String, Object> result = new HashMap<>();
        
        OrdreFab ordre = repository.findById(id).orElse(null);
        if (ordre == null) {
            throw new RuntimeException("Ordre de fabrication non trouvé");
        }

        if (!ordre.getStatuts().equals(StatutOrdre.EN_ATTENTE)) {
            throw new RuntimeException("Seuls les ordres en attente peuvent être démarrés");
        }

        // Calculer la nouvelle date de fin en gardant la même durée
        long durationDays = ordre.getDatefin().toEpochDay() - ordre.getDatedeb().toEpochDay();
        LocalDate newEndDate = newStartDate.plusDays(durationDays);

        // Vérifier la disponibilité pour la nouvelle période
        if (isLigneAvailable(ordre.getLigneProduction().getIdLigne(), newStartDate, newEndDate, id)) {
            ordre.setDatedeb(newStartDate);
            ordre.setDatefin(newEndDate);
            ordre.setStatuts(StatutOrdre.EN_COURS);
            OrdreFab updated = repository.save(ordre);
            
            result.put("success", true);
            result.put("ordre", updated);
            result.put("message", "Ordre reprogrammé et démarré avec succès");
        } else {
            throw new RuntimeException("La ligne n'est pas disponible pour la période demandée");
        }
        
        return result;
    }

    public LocalDate findNextAvailableDate(Long ligneId, long durationDays, Long excludeOrderId) {
        LigneProduction ligne = ligneProductionRepository.findById(ligneId).orElse(null);
        if (ligne == null) {
            throw new RuntimeException("Ligne de production non trouvée");
        }

        LocalDate today = LocalDate.now();
        LocalDate searchDate = today;
        
        // Rechercher jusqu'à 365 jours dans le futur
        for (int i = 0; i < 365; i++) {
            LocalDate potentialEndDate = searchDate.plusDays(durationDays);
            
            if (isLigneAvailable(ligneId, searchDate, potentialEndDate, excludeOrderId)) {
                return searchDate;
            }
            
            searchDate = searchDate.plusDays(1);
        }
        
        // Si aucune date n'est trouvée dans l'année, retourner une date dans un an
        return today.plusYears(1);
    }
}
