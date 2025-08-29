package tn.esprit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.dto.UserDTO;
import tn.esprit.backend.service.UserService;
import tn.esprit.backend.enums.Role;

import java.util.List;

@RestController
@RequestMapping("/api/admin/user-management")
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    @Autowired
    private UserService userService;

    @GetMapping("/default")
    public ResponseEntity<List<UserDTO>> getDefaultUsers() {
        List<UserDTO> defaultUsers = userService.getDefaultUsers();
        return ResponseEntity.ok(defaultUsers);
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserDTO>> getActiveUsers() {
        List<UserDTO> activeUsers = userService.getActiveUsers();
        return ResponseEntity.ok(activeUsers);
    }

    @GetMapping("/active-admin-param")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARAMETREUR')")
    public ResponseEntity<List<UserDTO>> getActiveAdminAndParametreurUsers() {
        List<UserDTO> activeUsers = userService.getActiveAdminAndParametreurUsers();
        return ResponseEntity.ok(activeUsers);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> allUsers = userService.getAllUsersForStats();
        return ResponseEntity.ok(allUsers);
    }

    @PostMapping("/{userId}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long userId, @RequestBody ActivationRequest request) {
        try {
            UserDTO activatedUser = userService.activateUser(userId, request.getDurationDays());
            if (activatedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(activatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long userId) {
        try {
            UserDTO deactivatedUser = userService.deactivateUser(userId);
            if (deactivatedUser == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(deactivatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<UserDTO> updateUserWithRole(@PathVariable Long userId, @RequestBody UpdateUserRoleRequest request) {
        try {
            Role newRole = Role.valueOf(request.getRole().toUpperCase());
            UserDTO updatedUser = userService.updateUserWithRole(userId, request.getUser(), newRole);
            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Classe interne pour la requête d'activation
    public static class ActivationRequest {
        private Integer durationDays;

        public ActivationRequest() {}

        public Integer getDurationDays() {
            return durationDays;
        }

        public void setDurationDays(Integer durationDays) {
            this.durationDays = durationDays;
        }
    }

    // Classe interne pour la requête de mise à jour avec rôle
    public static class UpdateUserRoleRequest {
        private UserDTO user;
        private String role;

        public UpdateUserRoleRequest() {}

        public UserDTO getUser() {
            return user;
        }

        public void setUser(UserDTO user) {
            this.user = user;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}