package tn.esprit.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.dto.UserDTO;
import tn.esprit.backend.service.UserService;

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
        UserDTO activatedUser = userService.activateUser(userId, request.getDurationDays());
        if (activatedUser == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(activatedUser);
    }

    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long userId) {
        UserDTO deactivatedUser = userService.deactivateUser(userId);
        if (deactivatedUser == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(deactivatedUser);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedUser);
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
}