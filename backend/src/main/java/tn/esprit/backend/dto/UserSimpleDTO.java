package tn.esprit.backend.dto;

import tn.esprit.backend.entity.User;

public class UserSimpleDTO {
    private Long matricule;
    private String username;
    private String prenom;

    public UserSimpleDTO() {}

    public UserSimpleDTO(Long matricule, String username, String prenom) {
        this.matricule = matricule;
        this.username = username;
        this.prenom = prenom;
    }

    public static UserSimpleDTO fromEntity(User user) {
        if (user == null) return null;
        return new UserSimpleDTO(user.getMatricule(), user.getUsername(), user.getPrenom());
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
}