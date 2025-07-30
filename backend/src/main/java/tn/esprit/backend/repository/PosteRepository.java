package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Poste;

public interface PosteRepository extends JpaRepository<Poste, Long> {}
