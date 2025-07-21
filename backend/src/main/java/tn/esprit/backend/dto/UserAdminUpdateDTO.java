package tn.esprit.backend.dto;

import lombok.Data;
import tn.esprit.backend.enums.Role;

// DTO pour la gestion par un ADMIN (tous les champs)
@Data
public class UserAdminUpdateDTO {
    private String username;
    private String prenom;
    private String adresseMail;
    private String motDePasse;
    private Role role; // Seul l'ADMIN peut modifier le rôle
}