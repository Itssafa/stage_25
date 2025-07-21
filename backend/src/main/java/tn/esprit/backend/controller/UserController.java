package tn.esprit.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.dto.UserResponseDTO;
import tn.esprit.backend.dto.UserSelfUpdateDTO;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user") // Changed mapping for user-specific actions
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    // IMPORTANT: Consider removing or deprecating the /api/auth/register and /api/auth/login
    // methods if PublicController is intended for these public actions.
    // For now, I'm assuming you will keep them to allow different auth flows or will remove them manually.
    // I am focusing on adding the self-management endpoints here.

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Get username from authenticated principal

        User user = userService.findByUsername(username);
        if (user == null) {
            return createErrorResponse("Utilisateur non trouvé.", HttpStatus.NOT_FOUND);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profil utilisateur récupéré avec succès.");
        response.put("user", convertToResponseDTO(user));
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UserSelfUpdateDTO updateDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Get username from authenticated principal

        User user = userService.findByUsername(username);
        if (user == null) {
            return createErrorResponse("Utilisateur non trouvé.", HttpStatus.NOT_FOUND);
        }

        // Update fields that are allowed to be self-modified
        user.setPrenom(updateDTO.getPrenom());
        user.setAdresseMail(updateDTO.getAdresseMail());

        // Only update password if provided and not blank
        if (updateDTO.getMotDePasse() != null && !updateDTO.getMotDePasse().isBlank()) {
            user.setMotDePasse(passwordEncoder.encode(updateDTO.getMotDePasse()));
        }

        User updatedUser = userService.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profil mis à jour avec succès.");
        response.put("user", convertToResponseDTO(updatedUser));
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }


    // Helper method to convert User entity to UserResponseDTO
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