package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Operation;

public interface OperationRepository extends JpaRepository<Operation, Long> {}
