package tn.esprit.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor

public class LigneProduction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLigne;

    private String nom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"lignesProduction"})
    private User user;

    @ManyToMany
    @JoinTable(
        name = "ligne_production_postes",
        joinColumns = @JoinColumn(name = "ligne_id"),
        inverseJoinColumns = @JoinColumn(name = "poste_id")
    )
    @JsonIgnoreProperties({"affectations", "user"})
    private Set<Poste> postesConstituants;

    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"ligne", "ordres"})
    private List<Produit> produits;
}

