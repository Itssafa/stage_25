package tn.esprit.backend.entity;

import jakarta.persistence.*;
import tn.esprit.backend.enums.TypeProd;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
public class Produit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduit;

    private String nom;

     @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeProd type;

    @ManyToOne
    @JoinColumn(name = "ligne_id")
    @JsonIgnoreProperties({"postes", "produits"})
    private LigneProduction ligne;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"produit"})
    private List<OrdreFab> ordres;

    // Constructors
    public Produit() {}

    public Produit(String nom, TypeProd type, LigneProduction ligne) {
        this.nom = nom;
        this.type = type;
        this.ligne = ligne;
    }

    // Getters and Setters
    public Long getIdProduit() {
        return idProduit;
    }

    public void setIdProduit(Long idProduit) {
        this.idProduit = idProduit;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public TypeProd getType() {
        return type;
    }

    public void setType(TypeProd type) {
        this.type = type;
    }

    public LigneProduction getLigne() {
        return ligne;
    }

    public void setLigne(LigneProduction ligne) {
        this.ligne = ligne;
    }

    public List<OrdreFab> getOrdres() {
        return ordres;
    }

    public void setOrdres(List<OrdreFab> ordres) {
        this.ordres = ordres;
    }
}

