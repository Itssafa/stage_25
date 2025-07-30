package tn.esprit.backend.service;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.repository.OrdreFabRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrdreFabService {

    @Autowired
    private OrdreFabRepository repository;

    public List<OrdreFab> getAll() {
        return repository.findAll();
    }

    public OrdreFab getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public OrdreFab create(OrdreFab obj) {
        return repository.save(obj);
    }

    public OrdreFab update(Long id, OrdreFab updated) {
        OrdreFab existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre à jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
