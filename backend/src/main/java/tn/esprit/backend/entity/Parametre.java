package tn.esprit.backend.entity;

import jakarta.persistence.*;

@Entity
public class Parametre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idParam;

    private String nom;
    private String valeur;

    @ManyToOne
    @JoinColumn(name = "operation_id")
    private Operation operation;
}

