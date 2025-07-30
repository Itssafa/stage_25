package tn.esprit.backend.service;

import tn.esprit.backend.entity.Operation;
import tn.esprit.backend.repository.OperationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OperationService {

    @Autowired
    private OperationRepository repository;

    public List<Operation> getAll() {
        return repository.findAll();
    }

    public Operation getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Operation create(Operation obj) {
        return repository.save(obj);
    }

    public Operation update(Long id, Operation updated) {
        Operation existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        // TODO: mettre à jour les champs manuellement ici
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
