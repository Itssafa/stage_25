package tn.esprit.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.annotation.RequireRole;
import tn.esprit.backend.annotation.RequireLoginCapability;
import tn.esprit.backend.dto.UserResponseDTO;
import tn.esprit.backend.dto.UserSelfUpdateDTO;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;
import tn.esprit.backend.service.UserService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/parametreur")
@RequiredArgsConstructor
@Slf4j
public class ParametreurController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    @RequireRole({Role.PARAMETREUR, Role.ADMIN})
    @RequireLoginCapability
    public ResponseEntity<?> getProfile() {
        try {
            String username = getCurrentUsername();
            User currentUser = userService.findByUsername(username);

            if (currentUser == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", convertToResponseDTO(currentUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du profil: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/profile")
    @RequireRole({Role.PARAMETREUR, Role.ADMIN})
    @RequireLoginCapability
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserSelfUpdateDTO updateDTO) {
        try {
            String username = getCurrentUsername();
            User currentUser = userService.findByUsername(username);

            if (currentUser == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            // Mise à jour des champs autorisés (pas username ni role)
            if (updateDTO.getPrenom() != null) {
                currentUser.setPrenom(updateDTO.getPrenom());
            }
            
            if (updateDTO.getAdresseMail() != null) {
                currentUser.setAdresseMail(updateDTO.getAdresseMail());
            }
            
            if (updateDTO.getMotDePasse() != null && !updateDTO.getMotDePasse().isEmpty()) {
                currentUser.setMotDePasse(passwordEncoder.encode(updateDTO.getMotDePasse()));
            }

            User updatedUser = userService.save(currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profil mis à jour avec succès");
            response.put("user", convertToResponseDTO(updatedUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour du profil: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/dashboard")
    @RequireRole({Role.PARAMETREUR, Role.ADMIN})
    @RequireLoginCapability
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Tableau de bord PARAMETREUR");
        response.put("availableFeatures", new String[]{
            "Gestion des entités autorisées",
            "Consultation des données",
            "Modification du profil personnel"
        });
        response.put("restrictions", new String[]{
            "Ne peut pas modifier son nom d'utilisateur",
            "Ne peut pas modifier son rôle",
            "Ne peut pas gérer d'autres utilisateurs"
        });
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }

    // Exemple d'endpoint pour gérer les entités (à adapter selon vos besoins)
    @GetMapping("/entities")
    @RequireRole({Role.PARAMETREUR, Role.ADMIN})
    @RequireLoginCapability
    public ResponseEntity<?> getEntities() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Liste des entités gérables par PARAMETREUR");
        response.put("entities", new String[]{"Entity1", "Entity2", "Entity3"}); // À remplacer par vos vraies entités
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setMatricule(user.getMatricule());
        dto.setUsername(user.getUsername());
        dto.setPrenom(user.getPrenom());
        dto.setAdresseMail(user.getAdresseMail());
        dto.setRole(user.getRole());
        return dto;
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(response);
    }
}