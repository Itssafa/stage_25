package tn.esprit.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// DTO pour la connexion
@Data
public class LoginDTO {
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String motDePasse;
}