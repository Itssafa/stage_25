package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.entity.EtatPoste;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PosteDTO {
    private Long idPoste;
    private String nom;
    private UserSimpleDTO user;
    private String etat;
    private List<LigneProductionSimpleDTO> lignesProduction;
    
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
        
        // Ajouter les lignes de production
        if (poste.getLignesProduction() != null) {
            dto.setLignesProduction(
                poste.getLignesProduction().stream()
                    .map(LigneProductionSimpleDTO::fromEntity)
                    .collect(Collectors.toList())
            );
        }
        
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

    public List<LigneProductionSimpleDTO> getLignesProduction() {
        return lignesProduction;
    }

    public void setLignesProduction(List<LigneProductionSimpleDTO> lignesProduction) {
        this.lignesProduction = lignesProduction;
    }
}