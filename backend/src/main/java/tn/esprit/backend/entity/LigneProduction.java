package tn.esprit.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor

public class LigneProduction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLigne;

    private String nom;

    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL)
    private List<Poste> postes;

    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL)
    private List<Produit> produits;
}

