package tn.esprit.backend.dto;

import tn.esprit.backend.entity.User;
import tn.esprit.backend.enums.Role;
import java.time.LocalDateTime;

public class UserDTO {
    private Long matricule;
    private String username;
    private String prenom;
    private String adresseMail;
    private Role role;
    private Boolean isActive;
    private LocalDateTime activationDate;
    private Integer activationDurationDays;
    private LocalDateTime deactivationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDTO() {}

    public UserDTO(Long matricule, String username, String prenom, String adresseMail, 
                   Role role, Boolean isActive, LocalDateTime activationDate, 
                   Integer activationDurationDays, LocalDateTime deactivationDate,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.matricule = matricule;
        this.username = username;
        this.prenom = prenom;
        this.adresseMail = adresseMail;
        this.role = role;
        this.isActive = isActive;
        this.activationDate = activationDate;
        this.activationDurationDays = activationDurationDays;
        this.deactivationDate = deactivationDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setMatricule(user.getMatricule());
        dto.setUsername(user.getUsername());
        dto.setPrenom(user.getPrenom());
        dto.setAdresseMail(user.getAdresseMail());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setActivationDate(user.getActivationDate());
        dto.setActivationDurationDays(user.getActivationDurationDays());
        dto.setDeactivationDate(user.getDeactivationDate());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getMatricule() {
        return matricule;
    }

    public void setMatricule(Long matricule) {
        this.matricule = matricule;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getAdresseMail() {
        return adresseMail;
    }

    public void setAdresseMail(String adresseMail) {
        this.adresseMail = adresseMail;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(LocalDateTime activationDate) {
        this.activationDate = activationDate;
    }

    public Integer getActivationDurationDays() {
        return activationDurationDays;
    }

    public void setActivationDurationDays(Integer activationDurationDays) {
        this.activationDurationDays = activationDurationDays;
    }

    public LocalDateTime getDeactivationDate() {
        return deactivationDate;
    }

    public void setDeactivationDate(LocalDateTime deactivationDate) {
        this.deactivationDate = deactivationDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}