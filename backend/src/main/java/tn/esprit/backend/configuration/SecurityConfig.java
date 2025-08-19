package tn.esprit.backend.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tn.esprit.backend.filter.JwtFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics accessibles sans authentification
                        .requestMatchers("/api/public/**", "/test-simple", "/hello", "/error", "/api/auth/send-sms-code", "/api/auth/verify-sms-code", "/api/auth/send-reset-code", "/api/auth/reset-password").permitAll()

                        // Endpoints autorisés aux rôles ADMIN et PARAMETREUR
                        .requestMatchers("/api/ligneproductions/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/postes/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/produits/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/operations/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/parametres/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/affectations/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/ordrefabs/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")
                        .requestMatchers("/api/applications/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_PARAMETREUR")

                        // Toute autre requête doit être authentifiée
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:4200", "http://127.0.0.1:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
