package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.LigneProduction;

public interface LigneProductionRepository extends JpaRepository<LigneProduction, Long> {}
