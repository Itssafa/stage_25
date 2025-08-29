package tn.esprit.backend.dto;

import tn.esprit.backend.entity.LigneProduction;

public class LigneProductionSimpleDTO {
    private Long idLigne;
    private String nom;

    public LigneProductionSimpleDTO() {}

    public LigneProductionSimpleDTO(Long idLigne, String nom) {
        this.idLigne = idLigne;
        this.nom = nom;
    }

    public static LigneProductionSimpleDTO fromEntity(LigneProduction ligne) {
        if (ligne == null) return null;
        return new LigneProductionSimpleDTO(ligne.getIdLigne(), ligne.getNom());
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
}