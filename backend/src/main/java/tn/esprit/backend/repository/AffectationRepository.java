package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.backend.entity.Affectation;
import java.util.List;
import java.util.Optional;

public interface AffectationRepository extends JpaRepository<Affectation, Long> {
    
    // Trouver l'affectation active d'une application
    Optional<Affectation> findByApplicationIdAppAndActiveTrue(Long applicationId);
    
    // Trouver l'affectation active d'un poste
    Optional<Affectation> findByPosteIdPosteAndActiveTrue(Long posteId);
    
    // Trouver toutes les affectations actives
    List<Affectation> findByActiveTrue();
    
    // Trouver l'historique des affectations d'une application
    List<Affectation> findByApplicationIdAppOrderByDateDebutDesc(Long applicationId);
    
    // Trouver l'historique des affectations d'un poste
    List<Affectation> findByPosteIdPosteOrderByDateDebutDesc(Long posteId);
}
