package tn.esprit.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

// DTO pour la création d'un compte (front-office)
@Data
public class UserRegistrationDTO {
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    private String username;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Format de téléphone invalide")
    private String telephone;

    @Email(message = "L'adresse email doit être valide")
    private String adresseMail;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit comporter au moins 8 caractères")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$",
        message = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un caractère spécial"
    )
    private String motDePasse;
    
    // Le rôle sera automatiquement défini à DEFAULT
}