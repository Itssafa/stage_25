package tn.esprit.backend.dto;

import tn.esprit.backend.entity.Operation;

public class OperationDTO {
    private Long id;
    private String description;
    private String nomOp;

    public OperationDTO() {}

    public OperationDTO(Long id, String nomOp, String description) {
        this.id = id;
        this.nomOp = nomOp;
        this.description = description;
    }

    public static OperationDTO fromEntity(Operation operation) {
        OperationDTO dto = new OperationDTO();
        dto.setId(operation.getId());
        dto.setNomOp(operation.getNomOp());
        dto.setDescription(operation.getDescription());
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

}