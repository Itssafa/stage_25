package tn.esprit.backend.dto;

import java.time.LocalDateTime;

public class ApplicationDTO {
    private Long idApp;
    private String nomApp;
    private String description;
    private Long operationId;
    private String operationNom;
    private String userMatricule;
    
    // Informations sur l'affectation active
    private boolean currentlyAffected;
    private Long currentPosteId;
    private String currentPosteNom;
    private LocalDateTime currentAffectationDate;

    public ApplicationDTO() {}

    public ApplicationDTO(Long idApp, String nomApp, String description) {
        this.idApp = idApp;
        this.nomApp = nomApp;
        this.description = description;
        this.currentlyAffected = false;
    }

    // Getters and Setters
    public Long getIdApp() {
        return idApp;
    }

    public void setIdApp(Long idApp) {
        this.idApp = idApp;
    }

    public String getNomApp() {
        return nomApp;
    }

    public void setNomApp(String nomApp) {
        this.nomApp = nomApp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOperationId() {
        return operationId;
    }

    public void setOperationId(Long operationId) {
        this.operationId = operationId;
    }

    public String getOperationNom() {
        return operationNom;
    }

    public void setOperationNom(String operationNom) {
        this.operationNom = operationNom;
    }

    public String getUserMatricule() {
        return userMatricule;
    }

    public void setUserMatricule(String userMatricule) {
        this.userMatricule = userMatricule;
    }

    public boolean isCurrentlyAffected() {
        return currentlyAffected;
    }

    public void setCurrentlyAffected(boolean currentlyAffected) {
        this.currentlyAffected = currentlyAffected;
    }

    public Long getCurrentPosteId() {
        return currentPosteId;
    }

    public void setCurrentPosteId(Long currentPosteId) {
        this.currentPosteId = currentPosteId;
    }

    public String getCurrentPosteNom() {
        return currentPosteNom;
    }

    public void setCurrentPosteNom(String currentPosteNom) {
        this.currentPosteNom = currentPosteNom;
    }

    public LocalDateTime getCurrentAffectationDate() {
        return currentAffectationDate;
    }

    public void setCurrentAffectationDate(LocalDateTime currentAffectationDate) {
        this.currentAffectationDate = currentAffectationDate;
    }
}