package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAffectation;

    @ManyToOne
    @JoinColumn(name = "poste_id")
    @JsonIgnoreProperties({"affectations", "ligne", "user"})
    private Poste poste;

    @ManyToOne
    @JoinColumn(name = "application_id")
    @JsonIgnoreProperties({"affectations", "user"})
    private Application application;

    @OneToOne(mappedBy = "affectation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"affectation"})
    private Parametre parametre;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(name = "active")
    private Boolean active;

    // Constructors
    public Affectation() {}

    public Affectation(Poste poste, Application application) {
        this.poste = poste;
        this.application = application;
        this.dateDebut = LocalDateTime.now();
        this.active = true;
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

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public Boolean isActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
