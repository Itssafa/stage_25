package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.backend.entity.Produit;

public interface ProduitRepository extends JpaRepository<Produit, Long> {}
