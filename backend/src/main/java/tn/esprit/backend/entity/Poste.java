package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Set;

@Entity
public class Poste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPoste;

    private String nom;


    @OneToMany(mappedBy = "poste", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"poste", "parametre"})
    private List<Affectation> affectations;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_matricule")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat")
    private EtatPoste etat = EtatPoste.NON_CONFIGURE;

    @ManyToMany(mappedBy = "postesConstituants")
    @JsonIgnoreProperties({"postesConstituants", "produits"})
    private Set<LigneProduction> lignesProduction;

    // Constructors
    public Poste() {}

    public Poste(String nom) {
        this.nom = nom;
    }

    // Getters and Setters
    public Long getIdPoste() {
        return idPoste;
    }

    public void setIdPoste(Long idPoste) {
        this.idPoste = idPoste;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }


    public List<Affectation> getAffectations() {
        return affectations;
    }

    public void setAffectations(List<Affectation> affectations) {
        this.affectations = affectations;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public EtatPoste getEtat() {
        return etat;
    }

    public void setEtat(EtatPoste etat) {
        this.etat = etat;
    }

    public Set<LigneProduction> getLignesProduction() {
        return lignesProduction;
    }

    public void setLignesProduction(Set<LigneProduction> lignesProduction) {
        this.lignesProduction = lignesProduction;
    }
}
