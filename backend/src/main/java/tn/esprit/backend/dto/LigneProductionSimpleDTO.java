package tn.esprit.backend.dto;

public class LigneProductionSimpleDTO {
    private Long idLigne;
    private String nom;

    public LigneProductionSimpleDTO() {}

    public LigneProductionSimpleDTO(Long idLigne, String nom) {
        this.idLigne = idLigne;
        this.nom = nom;
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