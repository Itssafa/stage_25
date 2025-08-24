package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Parametre;
import java.util.List;

public interface ParametreRepository extends JpaRepository<Parametre, Long> {
    List<Parametre> findByAffectationIdAffectation(Long affectationId);
}
