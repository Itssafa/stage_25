package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {}
