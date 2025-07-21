package tn.esprit.backend.dto;

import lombok.Data;
import tn.esprit.backend.enums.Role;

// DTO pour la réponse (pas de mot de passe)
@Data
public class UserResponseDTO {
    private Long matricule;
    private String username;
    private String prenom;
    private String adresseMail;
    private Role role;
}