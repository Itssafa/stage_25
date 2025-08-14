package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Produit;
import tn.esprit.backend.enums.TypeProd;

public class ProduitDTO {
    private Long idProduit;
    private String nom;
    private TypeProd type;
    private LigneProductionSimpleDTO ligne;

    public ProduitDTO() {}

    public ProduitDTO(Long idProduit, String nom, TypeProd type, LigneProductionSimpleDTO ligne) {
        this.idProduit = idProduit;
        this.nom = nom;
        this.type = type;
        this.ligne = ligne;
    }

    public static ProduitDTO fromEntity(Produit produit) {
        ProduitDTO dto = new ProduitDTO();
        dto.setIdProduit(produit.getIdProduit());
        dto.setNom(produit.getNom());
        dto.setType(produit.getType());
        if (produit.getLigne() != null) {
            dto.setLigne(new LigneProductionSimpleDTO(
                produit.getLigne().getIdLigne(),
                produit.getLigne().getNom()
            ));
        }
        return dto;
    }

    // Getters and Setters
    public Long getIdProduit() {
        return idProduit;
    }

    public void setIdProduit(Long idProduit) {
        this.idProduit = idProduit;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public TypeProd getType() {
        return type;
    }

    public void setType(TypeProd type) {
        this.type = type;
    }

    public LigneProductionSimpleDTO getLigne() {
        return ligne;
    }

    public void setLigne(LigneProductionSimpleDTO ligne) {
        this.ligne = ligne;
    }
}