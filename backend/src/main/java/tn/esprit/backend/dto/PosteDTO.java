package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Poste;

public class PosteDTO {
    private Long idPoste;
    private String nom;
    private LigneProductionSimpleDTO ligne;

    public PosteDTO() {}

    public PosteDTO(Long idPoste, String nom, LigneProductionSimpleDTO ligne) {
        this.idPoste = idPoste;
        this.nom = nom;
        this.ligne = ligne;
    }

    public static PosteDTO fromEntity(Poste poste) {
        PosteDTO dto = new PosteDTO();
        dto.setIdPoste(poste.getIdPoste());
        dto.setNom(poste.getNom());
        if (poste.getLigne() != null) {
            dto.setLigne(new LigneProductionSimpleDTO(
                poste.getLigne().getIdLigne(),
                poste.getLigne().getNom()
            ));
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

    public LigneProductionSimpleDTO getLigne() {
        return ligne;
    }

    public void setLigne(LigneProductionSimpleDTO ligne) {
        this.ligne = ligne;
    }
}