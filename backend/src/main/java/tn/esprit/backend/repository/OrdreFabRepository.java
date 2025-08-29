package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.entity.StatutOrdre;

import java.time.LocalDate;
import java.util.List;

public interface OrdreFabRepository extends JpaRepository<OrdreFab, Long> {
    
    @Query("SELECT o FROM OrdreFab o WHERE o.ligneProduction = :ligne " +
           "AND o.statuts NOT IN (:excludedStatuts) " +
           "AND ((o.datedeb <= :dateFin AND o.datefin >= :dateDebut))")
    List<OrdreFab> findConflictingOrders(@Param("ligne") LigneProduction ligne,
                                        @Param("dateDebut") LocalDate dateDebut,
                                        @Param("dateFin") LocalDate dateFin,
                                        @Param("excludedStatuts") List<StatutOrdre> excludedStatuts);
    
    @Query("SELECT o FROM OrdreFab o WHERE o.ligneProduction = :ligne " +
           "AND o.statuts NOT IN (:excludedStatuts) " +
           "AND ((o.datedeb <= :dateFin AND o.datefin >= :dateDebut)) " +
           "AND o.id_orf != :excludeOrderId")
    List<OrdreFab> findConflictingOrdersExcludingCurrent(@Param("ligne") LigneProduction ligne,
                                                         @Param("dateDebut") LocalDate dateDebut,
                                                         @Param("dateFin") LocalDate dateFin,
                                                         @Param("excludedStatuts") List<StatutOrdre> excludedStatuts,
                                                         @Param("excludeOrderId") Long excludeOrderId);
}
