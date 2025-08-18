package tn.esprit.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idApp;

    private String nomApp;
    private String description;

    @ManyToOne
    @JoinColumn(name = "operation_id")
    @JsonIgnoreProperties({})
    private Operation operation;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("application")
    private List<Affectation> affectations;

    // Constructors
    public Application() {}

    public Application(String nomApp, String description) {
        this.nomApp = nomApp;
        this.description = description;
    }

    public Application(String nomApp, String description, Operation operation) {
        this.nomApp = nomApp;
        this.description = description;
        this.operation = operation;
    }

    // Getters and Setters
    public Long getIdApp() {
        return idApp;
    }

    public void setIdApp(Long idApp) {
        this.idApp = idApp;
    }

    public String getNomApp() {
        return nomApp;
    }

    public void setNomApp(String nomApp) {
        this.nomApp = nomApp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Affectation> getAffectations() {
        return affectations;
    }

    public void setAffectations(List<Affectation> affectations) {
        this.affectations = affectations;
    }

    public Operation getOperation() {
        return operation;
    }

    public void setOperation(Operation operation) {
        this.operation = operation;
    }
}
