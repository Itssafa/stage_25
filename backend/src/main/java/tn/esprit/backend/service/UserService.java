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
}