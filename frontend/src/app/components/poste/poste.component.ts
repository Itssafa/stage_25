import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface LigneProduction {
  idLigne: number;
  nom: string;
}

interface Poste {
  idPoste?: number;
  nom: string;
  ligne?: LigneProduction;
}

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.css']
})
export class PosteComponent implements OnInit {
  posteForm: FormGroup;
  postes: Poste[] = [];
  lignes: LigneProduction[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/postes';
  private ligneApiUrl = 'http://localhost:8085/api/ligneproductions';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.posteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      ligneId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadPostes();
    this.loadLignes();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadLignes() {
    this.http.get<LigneProduction[]>(this.ligneApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.lignes = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des lignes:', err);
        }
      });
  }

  loadPostes() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Poste[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.postes = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des postes';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.posteForm.valid) {
      const posteData = {
        nom: this.posteForm.get('nom')?.value,
        ligne: { idLigne: this.posteForm.get('ligneId')?.value }
      };
      
      if (this.isEditing && this.editingId) {
        this.updatePoste(this.editingId, posteData);
      } else {
        this.createPoste(posteData);
      }
    }
  }

  createPoste(poste: any) {
    this.http.post<Poste>(this.apiUrl, poste, { headers: this.getHeaders() })
      .subscribe({
        next: (newPoste) => {
          this.postes.push(newPoste);
          this.resetForm();
          console.log('Poste créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du poste';
          console.error('Erreur:', err);
        }
      });
  }

  updatePoste(id: number, poste: any) {
    this.http.put<Poste>(`${this.apiUrl}/${id}`, poste, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedPoste) => {
          const index = this.postes.findIndex(p => p.idPoste === id);
          if (index !== -1) {
            this.postes[index] = updatedPoste;
          }
          this.resetForm();
          console.log('Poste mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du poste';
          console.error('Erreur:', err);
        }
      });
  }

  editPoste(poste: Poste) {
    this.isEditing = true;
    this.editingId = poste.idPoste || null;
    this.posteForm.patchValue({
      nom: poste.nom,
      ligneId: poste.ligne?.idLigne
    });
  }

  deletePoste(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.postes = this.postes.filter(p => p.idPoste !== id);
            console.log('Poste supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression du poste';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.posteForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }
}
