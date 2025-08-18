package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAffectation;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    @JsonIgnoreProperties({"affectations", "ligne"})
    private Poste poste;

    @ManyToOne
    @JoinColumn(name = "application_id")
    @JsonIgnoreProperties({"affectations"})
    private Application application;

    @OneToOne(mappedBy = "affectation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"affectation"})
    private Parametre parametre;

    // Constructors
    public Affectation() {}

    public Affectation(Poste poste, Application application) {
        this.poste = poste;
        this.application = application;
    }

    // Getters and Setters
    public Long getIdAffectation() {
        return idAffectation;
    }

    public void setIdAffectation(Long idAffectation) {
        this.idAffectation = idAffectation;
    }

    public Poste getPoste() {
        return poste;
    }

    public void setPoste(Poste poste) {
        this.poste = poste;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Parametre getParametre() {
        return parametre;
    }

    public void setParametre(Parametre parametre) {
        this.parametre = parametre;
    }
}
