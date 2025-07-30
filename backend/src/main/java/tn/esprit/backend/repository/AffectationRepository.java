package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Affectation;

public interface AffectationRepository extends JpaRepository<Affectation, Long> {}
