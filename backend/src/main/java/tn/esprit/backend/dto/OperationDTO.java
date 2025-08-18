package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Operation;

public class OperationDTO {
    private Long id;
    private String description;
    private String nomOp;
    private String parametre;

    public OperationDTO() {}

    public OperationDTO(Long id, String nomOp, String description, String parametre) {
        this.id = id;
        this.nomOp = nomOp;
        this.description = description;
        this.parametre = parametre;
    }

    public static OperationDTO fromEntity(Operation operation) {
        OperationDTO dto = new OperationDTO();
        dto.setId(operation.getId());
        dto.setNomOp(operation.getNomOp());
        dto.setDescription(operation.getDescription());
        dto.setParametre(operation.getParametre());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomOp() {
        return nomOp;
    }

    public void setNomOp(String nomOp) {
        this.nomOp = nomOp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getParametre() {
        return parametre;
    }

    public void setParametre(String parametre) {
        this.parametre = parametre;
    }
}