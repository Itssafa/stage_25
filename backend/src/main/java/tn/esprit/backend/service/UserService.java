package tn.esprit.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;
import tn.esprit.backend.repository.UserRepository;

import java.util.Collections;
import java.util.List;
import java.time.LocalDateTime;
import tn.esprit.backend.dto.UserDTO;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé avec le nom: " + username);
        }
        
        // Ajouter le préfixe ROLE_ si nécessaire
        String role = user.getRole().name();
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(), 
            user.getMotDePasse(),
            Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }

    // === ADDED MISSING METHODS ===
    public boolean existsByEmail(String email) {
        return userRepository.findByAdresseMail(email) != null;
    }
    
    public boolean updatePasswordByEmail(String email, String encodedPassword) {
        User user = userRepository.findByAdresseMail(email);
        if (user != null) {
            user.setMotDePasse(encodedPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }
    // === END OF ADDED METHODS ===

    // Méthodes CRUD
    public User save(User user) {
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getById(Long id) {
        return findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username) != null;
    }
    
    public boolean existsByTelephone(String telephone) {
        return userRepository.findByTelephone(telephone) != null;
    }
    
    public User findByTelephone(String telephone) {
        return userRepository.findByTelephone(telephone);
    }
    
    public boolean updatePasswordByTelephone(String telephone, String newPassword) {
        User user = userRepository.findByTelephone(telephone);
        if (user != null) {
            user.setMotDePasse(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    // Méthodes utilitaires pour les permissions
    public boolean canUserLogin(String username) {
        User user = findByUsername(username);
        return user != null && user.getRole().canLogin();
    }

    public boolean isUserAdmin(String username) {
        User user = findByUsername(username);
        return user != null && user.getRole() == Role.ADMIN;
    }

    public boolean canUserManageUsers(String username) {
        User user = findByUsername(username);
        return user != null && user.getRole().canManageUsers();
    }

    public boolean canUserManageEntities(String username) {
        User user = findByUsername(username);
        return user != null && user.getRole().canManageEntities();
    }

    // Méthodes pour la gestion des utilisateurs par ADMIN
    public List<UserDTO> getDefaultUsers() {
        List<User> defaultUsers = userRepository.findByRole(Role.DEFAULT);
        return defaultUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public List<UserDTO> getActiveUsers() {
        // CORRECTION: Récupérer TOUS les utilisateurs avec rôle ADMIN ou PARAMETREUR qui sont actifs
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        List<User> parametreurUsers = userRepository.findByRoleAndIsActive(Role.PARAMETREUR, Boolean.TRUE);
        
        List<User> allActiveUsers = new java.util.ArrayList<>();
        allActiveUsers.addAll(adminUsers); // Les admins sont toujours considérés comme actifs
        allActiveUsers.addAll(parametreurUsers);
        
        return allActiveUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public List<UserDTO> getActiveAdminAndParametreurUsers() {
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        List<User> parametreurUsers = userRepository.findByRoleAndIsActive(Role.PARAMETREUR, Boolean.TRUE);
        
        List<User> allUsers = new java.util.ArrayList<>();
        allUsers.addAll(adminUsers);
        allUsers.addAll(parametreurUsers);
        
        return allUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public UserDTO activateUser(Long userId, Integer durationDays) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getRole() != Role.DEFAULT) {
                return null;
            }

            // Vérifications des champs obligatoires avant activation
            if (user.getUsername() == null || user.getUsername().trim().isEmpty() ||
                user.getPrenom() == null || user.getPrenom().trim().isEmpty() ||
                user.getMotDePasse() == null || user.getMotDePasse().trim().isEmpty() ||
                user.getTelephone() == null || user.getTelephone().trim().isEmpty()) {
                throw new RuntimeException("L'utilisateur a des champs obligatoires manquants");
            }

            user.setRole(Role.PARAMETREUR);
            user.setIsActive(true);
            user.setActivationDate(LocalDateTime.now());
            user.setActivationDurationDays(durationDays);
            user.setDeactivationDate(null);

            User savedUser = userRepository.save(user);
            return UserDTO.fromEntity(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'activation de l'utilisateur: " + e.getMessage(), e);
        }
    }

    public UserDTO deactivateUser(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }
            
            // Vérifier que l'utilisateur est bien activable (pas déjà DEFAULT)
            if (user.getRole() != Role.PARAMETREUR && user.getRole() != Role.ADMIN) {
                return null; // Déjà désactivé ou rôle invalide
            }
            
            // Ne pas permettre de désactiver le dernier administrateur
            if (user.getRole() == Role.ADMIN) {
                long adminCount = userRepository.countByRole(Role.ADMIN);
                if (adminCount <= 1) {
                    throw new RuntimeException("Impossible de désactiver le dernier administrateur");
                }
            }

            // Désactiver l'utilisateur
            user.setRole(Role.DEFAULT);
            user.setIsActive(false);
            user.setDeactivationDate(LocalDateTime.now());
            user.setActivationDate(null);
            user.setActivationDurationDays(null);

            User savedUser = userRepository.save(user);
            return UserDTO.fromEntity(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la désactivation de l'utilisateur: " + e.getMessage(), e);
        }
    }

    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }

            // Validation des données
            if (userDTO.getUsername() == null || userDTO.getUsername().trim().isEmpty() ||
                userDTO.getPrenom() == null || userDTO.getPrenom().trim().isEmpty() ||
                userDTO.getAdresseMail() == null || userDTO.getAdresseMail().trim().isEmpty()) {
                throw new RuntimeException("Tous les champs sont obligatoires");
            }

            // Vérifier l'unicité du nom d'utilisateur (sauf pour l'utilisateur courant)
            User existingUser = userRepository.findByUsername(userDTO.getUsername());
            if (existingUser != null && !existingUser.getMatricule().equals(userId)) {
                throw new RuntimeException("Ce nom d'utilisateur est déjà utilisé");
            }

            user.setUsername(userDTO.getUsername());
            user.setPrenom(userDTO.getPrenom());
            user.setAdresseMail(userDTO.getAdresseMail());

            User savedUser = userRepository.save(user);
            return UserDTO.fromEntity(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la mise à jour de l'utilisateur: " + e.getMessage(), e);
        }
    }

    public UserDTO updateUserWithRole(Long userId, UserDTO userDTO, Role newRole) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }

            // Validation des données
            if (userDTO.getUsername() == null || userDTO.getUsername().trim().isEmpty() ||
                userDTO.getPrenom() == null || userDTO.getPrenom().trim().isEmpty() ||
                userDTO.getAdresseMail() == null || userDTO.getAdresseMail().trim().isEmpty()) {
                throw new RuntimeException("Tous les champs sont obligatoires");
            }

            // Vérifier l'unicité du nom d'utilisateur (sauf pour l'utilisateur courant)
            User existingUser = userRepository.findByUsername(userDTO.getUsername());
            if (existingUser != null && !existingUser.getMatricule().equals(userId)) {
                throw new RuntimeException("Ce nom d'utilisateur est déjà utilisé");
            }

            // Vérifier qu'on ne désactive pas le dernier admin
            if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {
                long adminCount = userRepository.countByRole(Role.ADMIN);
                if (adminCount <= 1) {
                    throw new RuntimeException("Impossible de changer le rôle du dernier administrateur");
                }
            }

            Role oldRole = user.getRole();

            // Mettre à jour les informations de base
            user.setUsername(userDTO.getUsername());
            user.setPrenom(userDTO.getPrenom());
            user.setAdresseMail(userDTO.getAdresseMail());

            // Appliquer la logique de changement de rôle
            applyRoleChangeLogic(user, oldRole, newRole);

            User savedUser = userRepository.save(user);
            return UserDTO.fromEntity(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la mise à jour de l'utilisateur: " + e.getMessage(), e);
        }
    }

    private void applyRoleChangeLogic(User user, Role oldRole, Role newRole) {
        if (oldRole.equals(newRole)) {
            return; // Pas de changement de rôle
        }

        user.setRole(newRole);

        // Logique d'activation/désactivation selon le nouveau rôle
        if (newRole == Role.ADMIN || newRole == Role.PARAMETREUR) {
            // DEFAULT → ADMIN/PARAMETREUR ou changement entre rôles actifs
            user.setIsActive(true);
            if (user.getActivationDate() == null) {
                user.setActivationDate(LocalDateTime.now());
            }
            user.setDeactivationDate(null);
        } else if (newRole == Role.DEFAULT) {
            // ADMIN/PARAMETREUR → DEFAULT
            user.setIsActive(false);
            user.setDeactivationDate(LocalDateTime.now());
            user.setActivationDate(null);
            user.setActivationDurationDays(null);
        }
    }

    public List<UserDTO> getAllUsersForStats() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }
}