package tn.esprit.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByUsername(String username);
    
    User findByPrenom(String prenom);
    
    List<User> findByRole(Role role);
    
    List<User> findByRoleAndIsActive(Role role, Boolean isActive);
    
    boolean existsByUsername(String username);
    
    // Méthodes utiles pour les statistiques
    long countByRole(Role role);
}