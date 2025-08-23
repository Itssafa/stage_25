package tn.esprit.backend.dto;

import java.time.LocalDateTime;

public class AffectationDTO {
    private Long idAffectation;
    private Long applicationId;
    private String applicationNom;
    private Long posteId;
    private String posteNom;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private boolean active;

    public AffectationDTO() {}

    public AffectationDTO(Long idAffectation, Long applicationId, String applicationNom, 
                         Long posteId, String posteNom, LocalDateTime dateDebut, boolean active) {
        this.idAffectation = idAffectation;
        this.applicationId = applicationId;
        this.applicationNom = applicationNom;
        this.posteId = posteId;
        this.posteNom = posteNom;
        this.dateDebut = dateDebut;
        this.active = active;
    }

    // Getters and Setters
    public Long getIdAffectation() {
        return idAffectation;
    }

    public void setIdAffectation(Long idAffectation) {
        this.idAffectation = idAffectation;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicationNom() {
        return applicationNom;
    }

    public void setApplicationNom(String applicationNom) {
        this.applicationNom = applicationNom;
    }

    public Long getPosteId() {
        return posteId;
    }

    public void setPosteId(Long posteId) {
        this.posteId = posteId;
    }

    public String getPosteNom() {
        return posteNom;
    }

    public void setPosteNom(String posteNom) {
        this.posteNom = posteNom;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}