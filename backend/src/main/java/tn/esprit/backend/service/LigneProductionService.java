package tn.esprit.backend.service;

import tn.esprit.backend.entity.LigneProduction;
import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.repository.LigneProductionRepository;
import tn.esprit.backend.repository.PosteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Service
public class LigneProductionService {

    @Autowired
    private LigneProductionRepository repository;

    @Autowired
    private PosteRepository posteRepository;

    public List<LigneProduction> getAll() {
        return repository.findAll();
    }

    public LigneProduction getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public LigneProduction create(LigneProduction obj) {
        return repository.save(obj);
    }

    public LigneProduction createWithPostes(LigneProduction ligne, List<Long> posteIds) {
        if (posteIds != null && !posteIds.isEmpty()) {
            Set<Poste> postes = new HashSet<>();
            for (Long posteId : posteIds) {
                Poste poste = posteRepository.findById(posteId).orElse(null);
                if (poste != null) {
                    postes.add(poste);
                }
            }
            ligne.setPostesConstituants(postes);
        }
        return repository.save(ligne);
    }

    public LigneProduction update(Long id, LigneProduction updated) {
        LigneProduction existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setNom(updated.getNom());
        return repository.save(existing);
    }

    public LigneProduction updateWithPostes(Long id, LigneProduction updated, List<Long> posteIds) {
        LigneProduction existing = repository.findById(id).orElse(null);
        if (existing == null) return null;
        
        existing.setNom(updated.getNom());
        
        if (posteIds != null) {
            Set<Poste> postes = new HashSet<>();
            for (Long posteId : posteIds) {
                Poste poste = posteRepository.findById(posteId).orElse(null);
                if (poste != null) {
                    postes.add(poste);
                }
            }
            existing.setPostesConstituants(postes);
        }
        
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
