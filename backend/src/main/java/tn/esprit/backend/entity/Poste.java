package tn.esprit.backend.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Poste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPoste;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "ligne_id")
    private LigneProduction ligne;

    @OneToMany(mappedBy = "poste", cascade = CascadeType.ALL)
    private List<Operation> operations;

    @OneToMany(mappedBy = "poste", cascade = CascadeType.ALL)
    private List<Affectation> affectations;
}

