package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

@Entity
public class Affectation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAffectation;

    private LocalDate dateAffectation;

    @ManyToOne
    @JoinColumn(name = "ordre_id")
    @JsonIgnoreProperties({"affectations", "produit"})
    private OrdreFab ordre;

    @ManyToOne
    @JoinColumn(name = "operation_id")
    @JsonIgnoreProperties({"affectations", "parametres", "poste"})
    private Operation operation;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    @JsonIgnoreProperties({"affectations", "operations", "ligne"})
    private Poste poste;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"affectations", "applications"})
    private User user;

    // Constructors
    public Affectation() {}

    public Affectation(LocalDate dateAffectation, OrdreFab ordre, Operation operation, Poste poste, User user) {
        this.dateAffectation = dateAffectation;
        this.ordre = ordre;
        this.operation = operation;
        this.poste = poste;
        this.user = user;
    }

    // Getters and Setters
    public Long getIdAffectation() {
        return idAffectation;
    }

    public void setIdAffectation(Long idAffectation) {
        this.idAffectation = idAffectation;
    }

    public LocalDate getDateAffectation() {
        return dateAffectation;
    }

    public void setDateAffectation(LocalDate dateAffectation) {
        this.dateAffectation = dateAffectation;
    }

    public OrdreFab getOrdre() {
        return ordre;
    }

    public void setOrdre(OrdreFab ordre) {
        this.ordre = ordre;
    }

    public Operation getOperation() {
        return operation;
    }

    public void setOperation(Operation operation) {
        this.operation = operation;
    }

    public Poste getPoste() {
        return poste;
    }

    public void setPoste(Poste poste) {
        this.poste = poste;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

