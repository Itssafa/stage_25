package tn.esprit.backend.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import tn.esprit.backend.annotation.RequireRole;
import tn.esprit.backend.annotation.RequireLoginCapability;
import tn.esprit.backend.enums.Role;
import tn.esprit.backend.service.UserService;
import tn.esprit.backend.entity.User;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionAspect {

    private final UserService userService;

    @Around("@annotation(requireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return createErrorResponse("Non authentifié", HttpStatus.UNAUTHORIZED);
        }

        String username = authentication.getName();
        User currentUser = userService.findByUsername(username);

        if (currentUser == null) {
            return createErrorResponse("Utilisateur non trouvé", HttpStatus.UNAUTHORIZED);
        }

        Role userRole = currentUser.getRole();
        Role[] requiredRoles = requireRole.value();

        boolean hasPermission = Arrays.asList(requiredRoles).contains(userRole);

        if (!hasPermission) {
            log.warn("Accès refusé pour l'utilisateur {} avec le rôle {} - Rôles requis: {}",
                    username, userRole, Arrays.toString(requiredRoles));
            return createErrorResponse("Accès refusé - Permissions insuffisantes", HttpStatus.FORBIDDEN);
        }

        return joinPoint.proceed();
    }

    // This aspect now effectively allows all authenticated users, as Role.canLogin() will return true.
    // If you need a more granular 'activation' system later, you'd reintroduce a boolean field to User entity
    // and modify this aspect to check that field.
    @Around("@annotation(requireLoginCapability)")
    public Object checkLoginCapability(ProceedingJoinPoint joinPoint, RequireLoginCapability requireLoginCapability) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return createErrorResponse("Non authentifié", HttpStatus.UNAUTHORIZED);
        }

        String username = authentication.getName();
        User currentUser = userService.findByUsername(username);

        if (currentUser == null) {
            return createErrorResponse("Utilisateur non trouvé", HttpStatus.UNAUTHORIZED);
        }

        Role userRole = currentUser.getRole();

        // As per the requirement, ALL users can now log in immediately.
        // The canLogin() method in Role.java is modified to reflect this.
        if (!userRole.canLogin()) { // This condition will now always be false for any valid role
            log.warn("Tentative de connexion refusée pour l'utilisateur {} avec le rôle {}", username, userRole);
            return createErrorResponse("Compte non activé. Contactez l'administrateur.", HttpStatus.FORBIDDEN);
        }

        return joinPoint.proceed();
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(response);
    }
}