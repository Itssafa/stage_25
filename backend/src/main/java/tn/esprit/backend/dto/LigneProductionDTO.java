package tn.esprit.backend.dto;

import tn.esprit.backend.entity.LigneProduction;
import java.util.List;
import java.util.stream.Collectors;

public class LigneProductionDTO {
    private Long idLigne;
    private String nom;
    private UserSimpleDTO user;
    private List<PosteDTO> postesConstituants;

    public LigneProductionDTO() {}

    public LigneProductionDTO(Long idLigne, String nom, UserSimpleDTO user) {
        this.idLigne = idLigne;
        this.nom = nom;
        this.user = user;
    }

    public LigneProductionDTO(Long idLigne, String nom, UserSimpleDTO user, List<PosteDTO> postesConstituants) {
        this.idLigne = idLigne;
        this.nom = nom;
        this.user = user;
        this.postesConstituants = postesConstituants;
    }

    public static LigneProductionDTO fromEntity(LigneProduction ligne) {
        if (ligne == null) return null;
        
        List<PosteDTO> postesDTO = null;
        if (ligne.getPostesConstituants() != null) {
            postesDTO = ligne.getPostesConstituants().stream()
                .map(PosteDTO::fromEntity)
                .collect(Collectors.toList());
        }
        
        return new LigneProductionDTO(
            ligne.getIdLigne(),
            ligne.getNom(),
            UserSimpleDTO.fromEntity(ligne.getUser()),
            postesDTO
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

    public List<PosteDTO> getPostesConstituants() {
        return postesConstituants;
    }

    public void setPostesConstituants(List<PosteDTO> postesConstituants) {
        this.postesConstituants = postesConstituants;
    }
}