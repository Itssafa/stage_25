package tn.esprit.backend.service;

import tn.esprit.backend.entity.Parametre;
import tn.esprit.backend.repository.ParametreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParametreService {

    @Autowired
    private ParametreRepository repository;

    public List<Parametre> getAll() {
        return repository.findAll();
    }

    public Parametre getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Parametre create(Parametre obj) {
        return repository.save(obj);
    }

    public Parametre update(Long id, Parametre updated) {
        Parametre existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre à jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
