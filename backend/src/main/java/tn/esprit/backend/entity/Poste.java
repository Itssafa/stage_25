package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
public class Poste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPoste;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "ligne_id")
    @JsonIgnoreProperties({"postes", "produits"})
    private LigneProduction ligne;

    @OneToMany(mappedBy = "poste", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"poste", "parametre"})
    private List<Affectation> affectations;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_matricule")
    private User user;

    // Constructors
    public Poste() {}

    public Poste(String nom, LigneProduction ligne) {
        this.nom = nom;
        this.ligne = ligne;
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

    public LigneProduction getLigne() {
        return ligne;
    }

    public void setLigne(LigneProduction ligne) {
        this.ligne = ligne;
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
}
