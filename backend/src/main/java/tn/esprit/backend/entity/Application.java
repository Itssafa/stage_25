package tn.esprit.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idApp;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"applications", "affectations"})
    private User user;

    // Constructors
    public Application() {}

    public Application(String nom, User user) {
        this.nom = nom;
        this.user = user;
    }

    // Getters and Setters
    public Long getIdApp() {
        return idApp;
    }

    public void setIdApp(Long idApp) {
        this.idApp = idApp;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

