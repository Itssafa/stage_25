package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;


@Entity
public class OrdreFab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_orf;

    private String code_fab;
    
    @Enumerated(EnumType.STRING)
    private StatutOrdre statuts;

    private int quantite;

    private LocalDate datedeb;
    private LocalDate datefin;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"ordres"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "produit_id")
    @JsonIgnoreProperties({"ordres", "ligne"})
    private Produit produit;

    @ManyToOne
    @JoinColumn(name = "ligne_production_id")
    @JsonIgnoreProperties({"postesConstituants", "produits"})
    private LigneProduction ligneProduction;

    // @OneToMany(mappedBy = "ordre", cascade = CascadeType.ALL)
    // @JsonIgnoreProperties({"ordre", "operation", "poste", "user"})
    // private List<Affectation> affectations;

    // Constructors
    public OrdreFab() {}

    public OrdreFab(String code_fab, StatutOrdre statuts, int quantite, LocalDate datedeb, LocalDate datefin, User user, Produit produit, LigneProduction ligneProduction) {
        this.code_fab = code_fab;
        this.statuts = statuts;
        this.quantite = quantite;
        this.datedeb = datedeb;
        this.datefin = datefin;
        this.user = user;
        this.produit = produit;
        this.ligneProduction = ligneProduction;
    }

    // Getters and Setters
    public Long getId_orf() {
        return id_orf;
    }

    public void setId_orf(Long id_orf) {
        this.id_orf = id_orf;
    }

    public String getCode_fab() {
        return code_fab;
    }

    public void setCode_fab(String code_fab) {
        this.code_fab = code_fab;
    }

    public StatutOrdre getStatuts() {
        return statuts;
    }

    public void setStatuts(StatutOrdre statuts) {
        this.statuts = statuts;
    }

    public int getQuantite() {
        return quantite;
    }

    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }

    public LocalDate getDatedeb() {
        return datedeb;
    }

    public void setDatedeb(LocalDate datedeb) {
        this.datedeb = datedeb;
    }

    public LocalDate getDatefin() {
        return datefin;
    }

    public void setDatefin(LocalDate datefin) {
        this.datefin = datefin;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Produit getProduit() {
        return produit;
    }

    public void setProduit(Produit produit) {
        this.produit = produit;
    }

    public LigneProduction getLigneProduction() {
        return ligneProduction;
    }

    public void setLigneProduction(LigneProduction ligneProduction) {
        this.ligneProduction = ligneProduction;
    }

    // public List<Affectation> getAffectations() {
    //     return affectations;
    // }

    // public void setAffectations(List<Affectation> affectations) {
    //     this.affectations = affectations;
    // }
}

