# Project Instructions for Future Agents

## 📋 Project Overview

This is a **Production Management System** built with:
- **Backend:** Spring Boot (Java) with JPA/Hibernate
- **Frontend:** Angular 18 with TypeScript  
- **Database:** MySQL (inferred from JPA usage)

## 🎯 Main Entities & Business Logic

### Core Entities:
1. **User** - System users with role-based access (ADMIN, PARAMETREUR, DEFAULT)
2. **LigneProduction** - Production lines that contain multiple postes
3. **Poste** - Work stations within production lines  
4. **Produit** - Products with types and associated production lines
5. **OrdreFab** - Manufacturing orders for products
6. **Operation** - Operations performed at postes
7. **Affectation** - Assignment of users to operations/postes
8. **Parametre** - Parameters for operations
9. **Application** - User applications/permissions

### Key Relationships:
- LigneProduction → Poste (1 to many)
- LigneProduction → Produit (1 to many)  
- Produit → OrdreFab (1 to many)
- Poste → Operation (1 to many)
- Operation → Parametre (1 to many)
- User → Affectation (1 to many)

## 🚨 Critical Issues Fixed (DO NOT BREAK THESE!)

### 1. **JSON Circular References**
- All entities have `@JsonIgnoreProperties` annotations
- Controllers return **DTOs** instead of entities to prevent infinite loops
- **NEVER remove these annotations or return raw entities from controllers**

### 2. **Entity Getters/Setters**
- All entities have complete getters/setters
- **DO NOT use Lombok @Data on entities with complex relationships**
- Only LigneProduction uses Lombok (and it works fine)

### 3. **Service Update Methods**
- All service update methods properly update fields using getters/setters
- **NEVER leave TODO comments in update methods**

### 4. **Frontend Error Handling**
- Components use `OnDestroy` with `takeUntil(destroy$)` to prevent memory leaks
- Token validation before API calls
- **ALWAYS implement proper subscription management**

## 📁 Project Structure

```
stage_25/
├── backend/
│   ├── src/main/java/tn/esprit/backend/
│   │   ├── entity/ (JPA entities)
│   │   ├── dto/ (Data Transfer Objects)
│   │   ├── controller/ (REST controllers)
│   │   ├── service/ (Business logic)
│   │   ├── repository/ (JPA repositories)
│   │   ├── enums/ (Enumerations)
│   │   └── configuration/ (Security, JWT)
│   └── pom.xml
└── frontend/
    ├── src/app/
    │   ├── components/ (Angular components)
    │   ├── services/ (HTTP services)
    │   ├── guards/ (Route guards)
    │   └── models/ (TypeScript interfaces)
    └── package.json
```

## 🛠️ Development Guidelines

### Backend Development:
1. **Always create DTOs for complex entities** to avoid circular references
2. **Use `@JsonIgnoreProperties`** on all entity relationships
3. **Implement complete getters/setters** for all entities
4. **Update service methods must actually update fields** using setters
5. **Controllers should return DTOs**, not entities
6. **Use `@CrossOrigin("*")`** for all controllers during development

### Frontend Development:
1. **Always implement `OnDestroy`** and use `takeUntil(destroy$)`
2. **Validate tokens before API calls** to prevent unnecessary errors
3. **Use proper error handling** with detailed logging
4. **Initialize arrays with `|| []`** to prevent null errors
5. **Follow the existing pattern** of separate components for each entity

### Security Notes:
- JWT authentication is implemented
- Role-based access control exists but may need refinement
- Some endpoints have security annotations that might cause issues
- **Test authentication thoroughly when adding new endpoints**

## 📋 Current Working Features

✅ **Fully Working:**
- User authentication & registration
- LigneProduction CRUD
- Poste CRUD (with ligne relationship display)
- Produit CRUD (with type enum dropdown)
- JWT security
- Role-based navigation

✅ **Recently Fixed:**
- JSON circular reference errors
- Update functionality (was adding instead of updating)
- Product type enumeration (now uses dropdown)
- N/A display issues in relationships

## 🔴 Known Missing Features

**See `MISSING_FEATURES.md` for complete list including:**
- Missing entity fields (Produit.code, Poste.etat, etc.)
- Missing enums (STATUTORDFAB, ETATPOSTE)
- Missing CRUD operations (OrdreFab, Operation, Parametre, Application)
- Field name mismatches with UML specifications

## 🧪 Testing Guidelines

### Before Making Changes:
1. **Run backend:** `cd backend && mvn spring-boot:run`
2. **Run frontend:** `cd frontend && ng serve`
3. **Test core functionality:** Login, navigate between pages, CRUD operations
4. **Check console for errors:** Both browser and backend logs

### After Making Changes:
1. **Compile backend:** `mvn compile` (should have no errors)
2. **Check for JSON parsing errors** in browser console
3. **Test all CRUD operations** don't just test happy path
4. **Test navigation between pages** to ensure no memory leaks
5. **Verify relationships display correctly** (not N/A)

## 🚨 Common Pitfalls to Avoid

1. **DO NOT** return entities directly from controllers
2. **DO NOT** remove `@JsonIgnoreProperties` annotations
3. **DO NOT** forget to implement getters/setters on new entities
4. **DO NOT** leave update methods unimplemented (TODO comments)
5. **DO NOT** add complex security annotations without testing
6. **DO NOT** forget `OnDestroy` implementation in Angular components
7. **DO NOT** assume npm packages are available - check package.json first

## 🔧 Useful Commands

### Backend:
```bash
cd backend
mvn clean compile          # Compile and check for errors
mvn spring-boot:run        # Run the application
```

### Frontend:
```bash
cd frontend  
npm install               # Install dependencies
ng serve                  # Run development server
ng build                  # Build for production
```

## 📞 Support Files

- **`MISSING_FEATURES.md`** - Complete list of missing features vs UML diagram
- **`Diagrammes corrigés (1).csv`** - Original UML diagram specifications
- **Console logs** - Check browser console for detailed error information

## 🎯 Next Priority Tasks

1. **Add missing enums** (STATUTORDFAB, ETATPOSTE)
2. **Add missing entity fields** per MISSING_FEATURES.md
3. **Create OrdreFab CRUD** (completely missing but specified in UML)
4. **Update field names** to match UML specifications
5. **Create missing CRUD operations** (Operation, Parametre, Application)

---

**Remember:** This project works currently but doesn't fully match the UML specifications. Decide whether to evolve the current working version or align it strictly with the UML diagram before making major changes.