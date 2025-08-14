package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    @JsonIgnoreProperties({"ordres", "ligne"})
    private Produit produit;

    @OneToMany(mappedBy = "ordre", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"ordre", "operation", "poste", "user"})
    private List<Affectation> affectations;

    // Constructors
    public OrdreFab() {}

    public OrdreFab(int quantite, LocalDate dateDebut, LocalDate dateFin, Produit produit) {
        this.quantite = quantite;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.produit = produit;
    }

    // Getters and Setters
    public Long getIdOrdre() {
        return idOrdre;
    }

    public void setIdOrdre(Long idOrdre) {
        this.idOrdre = idOrdre;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }

    public List<Affectation> getAffectations() {
        return affectations;
    }

    public void setAffectations(List<Affectation> affectations) {
        this.affectations = affectations;
    }
}

