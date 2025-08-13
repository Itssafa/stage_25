package tn.esprit.backend.service;

import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.repository.LigneProductionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LigneProductionService {

    @Autowired
    private LigneProductionRepository repository;

    public List<LigneProduction> getAll() {
        return repository.findAll();
    }

    public LigneProduction getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public LigneProduction create(LigneProduction obj) {
        return repository.save(obj);
    }

    public LigneProduction update(Long id, LigneProduction updated) {
        LigneProduction existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setNom(updated.getNom());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
