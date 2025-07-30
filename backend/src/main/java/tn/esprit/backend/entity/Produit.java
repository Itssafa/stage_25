package tn.esprit.backend.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Produit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduit;

    private String nom;
    private String type;

    @ManyToOne
    @JoinColumn(name = "ligne_id")
    private LigneProduction ligne;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    private List<OrdreFab> ordres;
}

