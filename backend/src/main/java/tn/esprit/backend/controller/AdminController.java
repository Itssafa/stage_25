package tn.esprit.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.annotation.RequireRole;
import tn.esprit.backend.annotation.RequireLoginCapability;
import tn.esprit.backend.dto.UserAdminUpdateDTO;
import tn.esprit.backend.dto.UserResponseDTO;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;
import tn.esprit.backend.service.UserService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> getDashboard() {
        try {
            // Statistiques des utilisateurs par rôle
            List<User> allUsers = userService.findAll();
            
            Map<Role, Long> userStats = allUsers.stream()
                .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tableau de bord ADMINISTRATEUR");
            response.put("totalUsers", allUsers.size());
            response.put("usersByRole", userStats);
            response.put("pendingActivations", userStats.getOrDefault(Role.DEFAULT, 0L));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du tableau de bord admin: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Role roleFilter) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            List<User> users;

            if (roleFilter != null) {
                users = userService.findByRole(roleFilter);
            } else {
                users = userService.findAll();
            }

            List<UserResponseDTO> userDTOs = users.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", userDTOs);
            response.put("totalElements", users.size());
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users/pending")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> getPendingUsers() {
        try {
            List<User> pendingUsers = userService.findByRole(Role.DEFAULT);
            
            List<UserResponseDTO> userDTOs = pendingUsers.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Utilisateurs en attente d'activation");
            response.put("users", userDTOs);
            response.put("count", userDTOs.size());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la récupération des utilisateurs en attente: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/users/{userId}/role")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestParam Role newRole) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            Role oldRole = user.getRole();
            user.setRole(newRole);
            User updatedUser = userService.save(user);

            log.info("ADMIN a changé le rôle de l'utilisateur {} de {} à {}", 
                    user.getUsername(), oldRole, newRole);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Rôle de l'utilisateur %s changé de %s à %s", 
                    user.getUsername(), oldRole, newRole));
            response.put("user", convertToResponseDTO(updatedUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la modification du rôle: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/users/{userId}")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserAdminUpdateDTO updateDTO) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            // Vérifier si le nouveau username existe déjà (si changé)
            if (updateDTO.getUsername() != null && 
                !updateDTO.getUsername().equals(user.getUsername()) &&
                userService.findByUsername(updateDTO.getUsername()) != null) {
                return createErrorResponse("Ce nom d'utilisateur est déjà utilisé", HttpStatus.BAD_REQUEST);
            }

            // Mise à jour des champs
            if (updateDTO.getUsername() != null) {
                user.setUsername(updateDTO.getUsername());
            }
            if (updateDTO.getPrenom() != null) {
                user.setPrenom(updateDTO.getPrenom());
            }
            if (updateDTO.getAdresseMail() != null) {
                user.setAdresseMail(updateDTO.getAdresseMail());
            }
            if (updateDTO.getMotDePasse() != null && !updateDTO.getMotDePasse().isEmpty()) {
                user.setMotDePasse(passwordEncoder.encode(updateDTO.getMotDePasse()));
            }
            if (updateDTO.getRole() != null) {
                user.setRole(updateDTO.getRole());
            }

            User updatedUser = userService.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Utilisateur mis à jour avec succès");
            response.put("user", convertToResponseDTO(updatedUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de l'utilisateur: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/users/{userId}")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            String username = user.getUsername();
            userService.deleteById(userId);

            log.info("ADMIN a supprimé l'utilisateur {}", username);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Utilisateur %s supprimé avec succès", username));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la suppression de l'utilisateur: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/users/{userId}/activate")
    @RequireRole(Role.ADMIN)
    @RequireLoginCapability
    public ResponseEntity<?> activateUser(
            @PathVariable Long userId,
            @RequestParam Role activationRole) {
        try {
            if (activationRole == Role.DEFAULT) {
                return createErrorResponse("Impossible d'activer avec le rôle DEFAULT", HttpStatus.BAD_REQUEST);
            }

            User user = userService.findById(userId);
            if (user == null) {
                return createErrorResponse("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
            }

            if (user.getRole() != Role.DEFAULT) {
                return createErrorResponse("Cet utilisateur est déjà activé", HttpStatus.BAD_REQUEST);
            }

            user.setRole(activationRole);
            User activatedUser = userService.save(user);

            log.info("ADMIN a activé l'utilisateur {} avec le rôle {}", user.getUsername(), activationRole);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("Utilisateur %s activé avec le rôle %s", 
                    user.getUsername(), activationRole));
            response.put("user", convertToResponseDTO(activatedUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de l'activation de l'utilisateur: {}", e.getMessage());
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
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