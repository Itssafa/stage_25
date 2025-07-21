package tn.esprit.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

// DTO pour l'édition par un PARAMETREUR (ses propres infos)
@Data
public class UserSelfUpdateDTO {
    // username et role non inclus = non modifiables
    
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Email(message = "L'adresse email doit être valide")
    private String adresseMail;

    @Size(min = 8, message = "Le mot de passe doit comporter au moins 8 caractères")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$",
        message = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un caractère spécial"
    )
    private String motDePasse; // Optionnel pour changement de mot de passe
}