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

    // Methodes pour la gestion des utilisateurs par ADMIN
    public List<UserDTO> getDefaultUsers() {
        List<User> defaultUsers = userRepository.findByRole(Role.DEFAULT);
        return defaultUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public List<UserDTO> getActiveUsers() {
        List<User> activeUsers = userRepository.findByRoleAndIsActive(Role.PARAMETREUR, true);
        return activeUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }

    public List<UserDTO> getActiveAdminAndParametreurUsers() {
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);
        List<User> parametreurUsers = userRepository.findByRoleAndIsActive(Role.PARAMETREUR, true);
        
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
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getRole() != Role.PARAMETREUR) {
            return null;
        }

        user.setRole(Role.DEFAULT);
        user.setIsActive(false);
        user.setDeactivationDate(LocalDateTime.now());
        user.setActivationDate(null);
        user.setActivationDurationDays(null);

        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        user.setUsername(userDTO.getUsername());
        user.setPrenom(userDTO.getPrenom());
        user.setAdresseMail(userDTO.getAdresseMail());

        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public List<UserDTO> getAllUsersForStats() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .map(UserDTO::fromEntity)
                .toList();
    }
}