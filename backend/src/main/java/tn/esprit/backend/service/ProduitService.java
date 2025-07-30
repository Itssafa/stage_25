package tn.esprit.backend.service;

import tn.esprit.backend.entity.Produit;
import tn.esprit.backend.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository repository;

    public List<Produit> getAll() {
        return repository.findAll();
    }

    public Produit getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Produit create(Produit obj) {
        return repository.save(obj);
    }

    public Produit update(Long id, Produit updated) {
        Produit existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre à jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
