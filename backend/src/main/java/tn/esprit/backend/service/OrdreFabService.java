package tn.esprit.backend.service;

import tn.esprit.backend.entity.OrdreFab;
import tn.esprit.backend.entity.StatutOrdre;
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
        // S'assurer que le statut par défaut est EN_ATTENTE si non défini
        if (obj.getStatuts() == null) {
            obj.setStatuts(StatutOrdre.EN_ATTENTE);
        }
        return repository.save(obj);
    }

    public OrdreFab update(Long id, OrdreFab updated) {
        OrdreFab existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setCode_fab(updated.getCode_fab());
        existing.setStatuts(updated.getStatuts());
        existing.setQuantite(updated.getQuantite());
        existing.setDatedeb(updated.getDatedeb());
        existing.setDatefin(updated.getDatefin());
        // Ne pas modifier l'utilisateur lors des mises à jour pour préserver le créateur
        if (updated.getUser() != null && existing.getUser() == null) {
            existing.setUser(updated.getUser());
        }
        existing.setProduit(updated.getProduit());
        
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
