package tn.esprit.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Affectation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAffectation;

    private LocalDate dateAffectation;

    @ManyToOne
    @JoinColumn(name = "ordre_id")
    private OrdreFab ordre;

    @ManyToOne
    @JoinColumn(name = "operation_id")
    private Operation operation;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    private Poste poste;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

