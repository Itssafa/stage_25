# Missing Features & Discrepancies

This document lists all the missing features and discrepancies between the current implementation and the UML diagram specifications found in "Diagrammes corrigés (1).csv".

## 🔴 Missing Fields

### Produit Entity
- **`code : String`** - Missing product code field
- **`ordreFab`** - Should be a relationship to OrdreFab entity, not String

### Poste Entity  
- **`etat : ETATPOSTE`** - Missing state field with enum

### User Entity
- **`nom : String`** - Missing last name field (currently only has `prenom`)

### OrdreFab Entity
- **`statut : STATUTORDFAB`** - Missing status field with enum
- **`code : String`** - Missing order code field

### Affectation Entity
- **`statAffect : boolean`** - Missing affectation status field

## 🔴 Missing Enums

### STATUTORDFAB
```java
public enum StatutOrdreFab {
    ENATTENTE,
    ENCOURS, 
    TERMINEE,
    ANNULE
}
```

### ETATPOSTE
```java
public enum EtatPoste {
    DISPONIBLE,
    OCCUPEE,
    ENMAINTENANCE
}
```

## 🔴 Incorrect Field Names

### Application Entity
- **Current:** `nom : String`
- **Should be:** `description : String`

### Operation Entity
- **Current:** `libelle : String`
- **Should be:** `description : String`
- **Current:** Has relationship to Parametre
- **Should be:** `Parametre : String` (according to diagram)

### Parametre Entity
- **Current:** `nom : String` and `valeur : String`
- **Should be:** `description : String`

## 🔴 Enum Value Mismatches

### TypeProd Enum
- **Current:** `C_E`
- **Should be:** `C.E` (with dot, not underscore)

### Role Enum
- **Current:** `ADMIN`
- **Should be:** `ADMINISTRATEUR`

## 🔴 Frontend Forms Missing

Based on the missing backend fields, the following frontend forms need updates:

### Produit Form
- Add `code` field (text input)
- Add `ordreFab` relationship selector

### Poste Form  
- Add `etat` field (dropdown with ETATPOSTE values)

### User Form
- Add `nom` field (text input)

### OrdreFab Form (Completely Missing)
- Create complete CRUD for OrdreFab entity
- Fields: `code`, `statut`, `quantite`, `dateDebut`, `dateFin`, `produit`

### Affectation Form
- Add `statAffect` field (checkbox/toggle)

## 🔴 Database Schema Updates Needed

All missing fields require corresponding database schema updates:

```sql
-- Add missing columns
ALTER TABLE produit ADD COLUMN code VARCHAR(255);
ALTER TABLE poste ADD COLUMN etat VARCHAR(50);
ALTER TABLE users ADD COLUMN nom VARCHAR(255);
ALTER TABLE ordre_fab ADD COLUMN statut VARCHAR(50);
ALTER TABLE ordre_fab ADD COLUMN code VARCHAR(255);
ALTER TABLE affectation ADD COLUMN stat_affect BOOLEAN;

-- Update existing columns
ALTER TABLE application RENAME COLUMN nom TO description;
ALTER TABLE operation RENAME COLUMN libelle TO description;
```

## 🔴 Use Cases from Diagram

The CSV shows the following use cases that need implementation:
1. ✅ Consulte la page d'accueil
2. ✅ Crée un compte  
3. ✅ S'authentifier
4. ✅ Gère les produits
5. ✅ Gère les postes
6. ✅ Gère la ligne de production
7. ❌ **Gère les paramètres** (missing CRUD)
8. ❌ **Gère les applications** (missing CRUD)
9. ❌ **Gère les opérations** (missing CRUD)
10. ✅ Gère les utilisateurs
11. ❌ **Gère les ordres de fabrication** (completely missing)

## 📋 Priority Implementation Order

1. **High Priority:**
   - Create missing enums (STATUTORDFAB, ETATPOSTE)
   - Add missing fields to existing entities
   - Update existing field names to match specifications

2. **Medium Priority:**
   - Create missing CRUD operations (OrdreFab, Operation, Parametre, Application)
   - Update frontend forms with missing fields

3. **Low Priority:**
   - Database migration scripts
   - Update DTOs to include new fields
   - Add proper validation for new enum fields

## 📝 Notes

- The current implementation seems to be a working prototype that doesn't fully follow the original UML design
- Some relationships might need to be reconsidered (e.g., Operation.Parametre as String vs relationship)
- Consider whether to update the current implementation or create a new version that strictly follows the UML diagram