package tn.esprit.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.backend.annotation.PublicEndpoint;
import tn.esprit.backend.configuration.JwtUtils;
import tn.esprit.backend.dto.LoginDTO;
import tn.esprit.backend.dto.UserRegistrationDTO;
import tn.esprit.backend.dto.UserResponseDTO;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;
import tn.esprit.backend.service.UserService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Ajout explicite du CORS
public class PublicController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        log.info("Test endpoint appelé");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Backend fonctionne correctement !");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PublicEndpoint
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            log.info("Tentative d'inscription pour l'utilisateur: {}", registrationDTO.getUsername());

            // Vérifier si le username existe déjà
            if (userService.findByUsername(registrationDTO.getUsername()) != null) {
                log.warn("Username déjà utilisé: {}", registrationDTO.getUsername());
                return createErrorResponse("Username is already in use", HttpStatus.BAD_REQUEST);
            }

            // Créer un nouvel utilisateur avec le rôle DEFAULT
            User newUser = new User();
            newUser.setUsername(registrationDTO.getUsername());
            newUser.setPrenom(registrationDTO.getPrenom());
            newUser.setAdresseMail(registrationDTO.getAdresseMail());
            newUser.setMotDePasse(passwordEncoder.encode(registrationDTO.getMotDePasse()));
            newUser.setRole(Role.DEFAULT);

            User savedUser = userService.save(newUser);
            log.info("Utilisateur créé avec succès: {}", savedUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Compte créé avec succès. Vous pouvez maintenant vous connecter.");
            response.put("user", convertToResponseDTO(savedUser));
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erreur lors de la création du compte: {}", e.getMessage(), e);
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    @PublicEndpoint
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            log.info("Tentative de connexion pour l'utilisateur: {}", loginDTO.getUsername());

            // Authentifier
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getMotDePasse())
            );

            if (authentication.isAuthenticated()) {
                log.info("Authentification réussie pour: {}", loginDTO.getUsername());

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Connexion réussie");
                response.put("token", jwtUtils.generateToken(loginDTO.getUsername()));
                response.put("type", "Bearer");

                User user = userService.findByUsername(loginDTO.getUsername());
                response.put("user", convertToResponseDTO(user));
                response.put("timestamp", System.currentTimeMillis());

                return ResponseEntity.ok(response);
            }

            log.warn("Échec de l'authentification pour: {}", loginDTO.getUsername());
            return createErrorResponse("Nom d'utilisateur ou mot de passe incorrect", HttpStatus.UNAUTHORIZED);

        } catch (AuthenticationException e) {
            log.error("Échec de l'authentification pour {}: {}", loginDTO.getUsername(), e.getMessage());
            return createErrorResponse("Nom d'utilisateur ou mot de passe incorrect", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Erreur lors de la connexion: {}", e.getMessage(), e);
            return createErrorResponse("Erreur interne du serveur", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/home")
    @PublicEndpoint
    public ResponseEntity<?> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bienvenue sur la page d'accueil");
        response.put("description", "Cette page est accessible à tous les utilisateurs");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
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