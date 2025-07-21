package tn.esprit.backend.enums;

public enum Role {
    DEFAULT("DEFAULT", "Utilisateur par défaut - accès limité"),
    PARAMETREUR("PARAMETREUR", "Utilisateur paramètreur - accès aux entités"),
    ADMIN("ADMIN", "Administrateur - tous les droits");

    private final String code;
    private final String description;

    Role(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    // Vérifier si le rôle peut se connecter
    public boolean canLogin() {
        return true;
    }

    // Vérifier si le rôle peut modifier d'autres utilisateurs
    public boolean canManageUsers() {
        return this == ADMIN;
    }

    // Vérifier si le rôle peut gérer les entités
    public boolean canManageEntities() {
        return this == PARAMETREUR || this == ADMIN;
    }
}