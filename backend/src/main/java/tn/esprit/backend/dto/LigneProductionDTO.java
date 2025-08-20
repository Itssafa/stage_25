package tn.esprit.backend.dto;

import tn.esprit.backend.entity.LigneProduction;

public class LigneProductionDTO {
    private Long idLigne;
    private String nom;
    private UserSimpleDTO user;

    public LigneProductionDTO() {}

    public LigneProductionDTO(Long idLigne, String nom, UserSimpleDTO user) {
        this.idLigne = idLigne;
        this.nom = nom;
        this.user = user;
    }

    public static LigneProductionDTO fromEntity(LigneProduction ligne) {
        if (ligne == null) return null;
        return new LigneProductionDTO(
            ligne.getIdLigne(),
            ligne.getNom(),
            UserSimpleDTO.fromEntity(ligne.getUser())
        );
    }

    // Getters and Setters
    public Long getIdLigne() {
        return idLigne;
    }

    public void setIdLigne(Long idLigne) {
        this.idLigne = idLigne;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public UserSimpleDTO getUser() {
        return user;
    }

    public void setUser(UserSimpleDTO user) {
        this.user = user;
    }
}