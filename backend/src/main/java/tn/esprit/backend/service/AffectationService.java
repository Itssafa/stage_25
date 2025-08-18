package tn.esprit.backend.service;

import tn.esprit.backend.entity.Affectation;
import tn.esprit.backend.repository.AffectationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AffectationService {

    @Autowired
    private AffectationRepository repository;

    public List<Affectation> getAll() {
        return repository.findAll();
    }

    public Affectation getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Affectation create(Affectation obj) {
        return repository.save(obj);
    }

    public Affectation update(Long id, Affectation updated) {
        Affectation existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre a jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
