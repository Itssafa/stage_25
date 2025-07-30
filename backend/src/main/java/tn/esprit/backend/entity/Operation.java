package tn.esprit.backend.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Operation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOp;

    private String libelle;
    private int temps;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    private Poste poste;

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL)
    private List<Parametre> parametres;

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL)
    private List<Affectation> affectations;
}

