package tn.esprit.backend.dto;

import java.util.List;

public class LigneProductionCreateDTO {
    private String nom;
    private List<Long> posteIds;

    public LigneProductionCreateDTO() {}

    public LigneProductionCreateDTO(String nom, List<Long> posteIds) {
        this.nom = nom;
        this.posteIds = posteIds;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public List<Long> getPosteIds() {
        return posteIds;
    }

    public void setPosteIds(List<Long> posteIds) {
        this.posteIds = posteIds;
    }
}