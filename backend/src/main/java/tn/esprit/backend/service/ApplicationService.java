package tn.esprit.backend.service;

import tn.esprit.backend.entity.Application;
import tn.esprit.backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository repository;

    public List<Application> getAll() {
        return repository.findAll();
    }

    public Application getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Application create(Application obj) {
        return repository.save(obj);
    }

    public Application update(Long id, Application updated) {
        Application existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre � jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
