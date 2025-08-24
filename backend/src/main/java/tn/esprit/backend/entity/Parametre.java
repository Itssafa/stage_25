package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Parametre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idParam;

    private String nom;
    private String description;
    private String valeur;

    @ManyToOne
    @JoinColumn(name = "affectation_id")
    @JsonIgnoreProperties({"parametres"})
    private Affectation affectation;

    // Constructors
    public Parametre() {}

    public Parametre(String nom, String description, String valeur, Affectation affectation) {
        this.nom = nom;
        this.description = description;
        this.valeur = valeur;
        this.affectation = affectation;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Affectation getAffectation() {
        return affectation;
    }

    public void setAffectation(Affectation affectation) {
        this.affectation = affectation;
    }

    public String getValeur() {
        return valeur;
    }

    public void setValeur(String valeur) {
        this.valeur = valeur;
    }
}

