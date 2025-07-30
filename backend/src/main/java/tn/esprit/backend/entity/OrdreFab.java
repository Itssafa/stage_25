package tn.esprit.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
public class OrdreFab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrdre;

    private int quantite;

    private LocalDate dateDebut;
    private LocalDate dateFin;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    private Produit produit;

    @OneToMany(mappedBy = "ordre", cascade = CascadeType.ALL)
    private List<Affectation> affectations;
}

