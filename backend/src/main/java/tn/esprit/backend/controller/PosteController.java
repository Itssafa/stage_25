package tn.esprit.backend.controller;

import tn.esprit.backend.entity.Poste;
import tn.esprit.backend.service.PosteService;
import tn.esprit.backend.dto.PosteDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/postes")
@CrossOrigin("*")
public class PosteController {

    @Autowired
    private PosteService service;

    @GetMapping
    public List<PosteDTO> getAll() {
        return service.getAll().stream()
                .map(PosteDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PosteDTO> getById(@PathVariable Long id) {
        Poste obj = service.getById(id);
        return obj != null ? ResponseEntity.ok(PosteDTO.fromEntity(obj)) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public PosteDTO create(@RequestBody Poste obj) {
        Poste created = service.create(obj);
        return PosteDTO.fromEntity(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PosteDTO> update(@PathVariable Long id, @RequestBody Poste obj) {
        Poste updated = service.update(id, obj);
        return updated != null ? ResponseEntity.ok(PosteDTO.fromEntity(updated)) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
