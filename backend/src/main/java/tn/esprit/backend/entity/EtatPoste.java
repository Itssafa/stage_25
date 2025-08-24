package tn.esprit.backend.entity;

public enum EtatPoste {
    CONFIGURE("configuré"),
    NON_CONFIGURE("non configuré");

    private final String libelle;

    EtatPoste(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}