package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    @JsonIgnoreProperties({"operations", "affectations", "ligne"})
    private Poste poste;

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"operation"})
    private List<Parametre> parametres;

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"operation", "ordre", "poste", "user"})
    private List<Affectation> affectations;

    // Constructors
    public Operation() {}

    public Operation(String libelle, int temps, Poste poste) {
        this.libelle = libelle;
        this.temps = temps;
        this.poste = poste;
    }

    // Getters and Setters
    public Long getIdOp() {
        return idOp;
    }

    public void setIdOp(Long idOp) {
        this.idOp = idOp;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public int getTemps() {
        return temps;
    }

    public void setTemps(int temps) {
        this.temps = temps;
    }

    public Poste getPoste() {
        return poste;
    }

    public void setPoste(Poste poste) {
        this.poste = poste;
    }

    public List<Parametre> getParametres() {
        return parametres;
    }

    public void setParametres(List<Parametre> parametres) {
        this.parametres = parametres;
    }

    public List<Affectation> getAffectations() {
        return affectations;
    }

    public void setAffectations(List<Affectation> affectations) {
        this.affectations = affectations;
    }
}

