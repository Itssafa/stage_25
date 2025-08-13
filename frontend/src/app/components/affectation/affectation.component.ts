import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Poste {
  idPoste: number;
  nom: string;
  ligne?: {
    nom: string;
  };
}

interface Operation {
  idOp: number;
  libelle: string;
  temps: number;
}

interface OrdreFab {
  idOrdre: number;
  quantite: number;
  produit?: {
    nom: string;
  };
}

interface Affectation {
  idAffectation?: number;
  dateDebut: string;
  dateFin: string;
  poste?: Poste;
  operation?: Operation;
  ordre?: OrdreFab;
}

@Component({
  selector: 'app-affectation',
  templateUrl: './affectation.component.html',
  styleUrls: ['./affectation.component.css']
})
export class AffectationComponent implements OnInit {
  affectationForm: FormGroup;
  affectations: Affectation[] = [];
  postes: Poste[] = [];
  operations: Operation[] = [];
  ordres: OrdreFab[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/affectations';
  private posteApiUrl = 'http://localhost:8085/api/postes';
  private operationApiUrl = 'http://localhost:8085/api/operations';
  private ordreApiUrl = 'http://localhost:8085/api/ordrefabs';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.affectationForm = this.fb.group({
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      posteId: ['', [Validators.required]],
      operationId: ['', [Validators.required]],
      ordreId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadAffectations();
    this.loadPostes();
    this.loadOperations();
    this.loadOrdres();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadPostes() {
    this.http.get<Poste[]>(this.posteApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.postes = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des postes:', err);
        }
      });
  }

  loadOperations() {
    this.http.get<Operation[]>(this.operationApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.operations = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des opérations:', err);
        }
      });
  }

  loadOrdres() {
    this.http.get<OrdreFab[]>(this.ordreApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.ordres = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des ordres:', err);
        }
      });
  }

  loadAffectations() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Affectation[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.affectations = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des affectations';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.affectationForm.valid) {
      const affectationData = {
        dateDebut: this.affectationForm.get('dateDebut')?.value,
        dateFin: this.affectationForm.get('dateFin')?.value,
        poste: { idPoste: this.affectationForm.get('posteId')?.value },
        operation: { idOp: this.affectationForm.get('operationId')?.value },
        ordre: { idOrdre: this.affectationForm.get('ordreId')?.value }
      };
      
      if (this.isEditing && this.editingId) {
        this.updateAffectation(this.editingId, affectationData);
      } else {
        this.createAffectation(affectationData);
      }
    }
  }

  createAffectation(affectation: any) {
    this.http.post<Affectation>(this.apiUrl, affectation, { headers: this.getHeaders() })
      .subscribe({
        next: (newAffectation) => {
          this.affectations.push(newAffectation);
          this.resetForm();
          console.log('Affectation créée avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de l\'affectation';
          console.error('Erreur:', err);
        }
      });
  }

  updateAffectation(id: number, affectation: any) {
    this.http.put<Affectation>(`${this.apiUrl}/${id}`, affectation, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedAffectation) => {
          const index = this.affectations.findIndex(a => a.idAffectation === id);
          if (index !== -1) {
            this.affectations[index] = updatedAffectation;
          }
          this.resetForm();
          console.log('Affectation mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'affectation';
          console.error('Erreur:', err);
        }
      });
  }

  editAffectation(affectation: Affectation) {
    this.isEditing = true;
    this.editingId = affectation.idAffectation || null;
    this.affectationForm.patchValue({
      dateDebut: affectation.dateDebut,
      dateFin: affectation.dateFin,
      posteId: affectation.poste?.idPoste,
      operationId: affectation.operation?.idOp,
      ordreId: affectation.ordre?.idOrdre
    });
  }

  deleteAffectation(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.affectations = this.affectations.filter(a => a.idAffectation !== id);
            console.log('Affectation supprimée avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de l\'affectation';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.affectationForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }
}
