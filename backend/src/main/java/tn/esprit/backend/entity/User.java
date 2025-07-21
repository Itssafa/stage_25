package tn.esprit.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import tn.esprit.backend.enums.Role;

@Data
@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long matricule;

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Column(unique = true)
    private String username;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Email(message = "L'adresse email doit être valide")
    private String adresseMail;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit comporter au moins 8 caractères")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$",
            message = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un caractère spécial"
    )
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.DEFAULT; // Rôle par défaut

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}