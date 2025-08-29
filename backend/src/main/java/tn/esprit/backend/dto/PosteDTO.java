package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.entity.EtatPoste;
import java.time.LocalDateTime;

public class PosteDTO {
    private Long idPoste;
    private String nom;
    private UserSimpleDTO user;
    private String etat;
    
    // Informations sur l'application actuellement affectée
    private boolean configured;
    private Long currentApplicationId;
    private String currentApplicationNom;
    private LocalDateTime currentAffectationDate;

    public PosteDTO() {}

    public PosteDTO(Long idPoste, String nom) {
        this.idPoste = idPoste;
        this.nom = nom;
        this.configured = false;
    }

    public static PosteDTO fromEntity(Poste poste) {
        PosteDTO dto = new PosteDTO();
        dto.setIdPoste(poste.getIdPoste());
        dto.setNom(poste.getNom());
        if (poste.getUser() != null) {
            dto.setUser(UserSimpleDTO.fromEntity(poste.getUser()));
        }
        dto.setEtat(poste.getEtat() != null ? poste.getEtat().getLibelle() : EtatPoste.NON_CONFIGURE.getLibelle());
        return dto;
    }

    // Getters and Setters
    public Long getIdPoste() {
        return idPoste;
    }

    public void setIdPoste(Long idPoste) {
        this.idPoste = idPoste;
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

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public Long getCurrentApplicationId() {
        return currentApplicationId;
    }

    public void setCurrentApplicationId(Long currentApplicationId) {
        this.currentApplicationId = currentApplicationId;
    }

    public String getCurrentApplicationNom() {
        return currentApplicationNom;
    }

    public void setCurrentApplicationNom(String currentApplicationNom) {
        this.currentApplicationNom = currentApplicationNom;
    }

    public LocalDateTime getCurrentAffectationDate() {
        return currentAffectationDate;
    }

    public void setCurrentAffectationDate(LocalDateTime currentAffectationDate) {
        this.currentAffectationDate = currentAffectationDate;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }
}