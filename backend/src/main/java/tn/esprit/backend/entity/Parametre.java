package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Parametre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idParam;

    private String nom;
    private String valeur;

    @ManyToOne
    @JoinColumn(name = "operation_id")
    @JsonIgnoreProperties({"parametres", "affectations", "poste"})
    private Operation operation;

    // Constructors
    public Parametre() {}

    public Parametre(String nom, String valeur, Operation operation) {
        this.nom = nom;
        this.valeur = valeur;
        this.operation = operation;
    }

    // Getters and Setters
    public Long getIdParam() {
        return idParam;
    }

    public void setIdParam(Long idParam) {
        this.idParam = idParam;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getValeur() {
        return valeur;
    }

    public void setValeur(String valeur) {
        this.valeur = valeur;
    }

    public Operation getOperation() {
        return operation;
    }

    public void setOperation(Operation operation) {
        this.operation = operation;
    }
}

