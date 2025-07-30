package tn.esprit.backend.service;

import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.repository.PosteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PosteService {

    @Autowired
    private PosteRepository repository;

    public List<Poste> getAll() {
        return repository.findAll();
    }

    public Poste getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Poste create(Poste obj) {
        return repository.save(obj);
    }

    public Poste update(Long id, Poste updated) {
        Poste existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre à jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
