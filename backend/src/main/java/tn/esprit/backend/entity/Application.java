package tn.esprit.backend.entity;

import jakarta.persistence.*;

@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idApp;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

