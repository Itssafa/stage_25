import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchFilterService } from '../../services/search-filter.service';

interface Poste {
  idPoste: number;
  nom: string;
  ligne?: {
    nom: string;
  };
}

interface Application {
  idApp: number;
  nomApp: string;
  description: string;
}

interface Affectation {
  idAffectation?: number;
  poste?: Poste;
  application?: Application;
}

@Component({
  selector: 'app-affectation',
  templateUrl: './affectation.component.html',
  styleUrls: ['./affectation.component.css']
})
export class AffectationComponent implements OnInit {
  affectationForm: FormGroup;
  affectations: Affectation[] = [];
  filteredAffectations: Affectation[] = [];
  postes: Poste[] = [];
  applications: Application[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/affectations';
  private posteApiUrl = 'http://localhost:8085/api/postes';
  private applicationApiUrl = 'http://localhost:8085/api/applications';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.affectationForm = this.fb.group({
      posteId: ['', [Validators.required]],
      appId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadAffectations();
    this.loadPostes();
    this.loadApplications();
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

  loadApplications() {
    this.http.get<Application[]>(this.applicationApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.applications = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des applications:', err);
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
      const posteId = this.affectationForm.get('posteId')?.value;
      const appId = this.affectationForm.get('appId')?.value;
      
      if (this.isEditing && this.editingId) {
        this.updateAffectation(this.editingId, { posteId, appId });
      } else {
        this.createAffectation(posteId, appId);
      }
    }
  }

  createAffectation(posteId: number, appId: number) {
    this.http.post<Affectation>(`${this.apiUrl}?posteId=${posteId}&appId=${appId}`, {}, { headers: this.getHeaders() })
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
      posteId: affectation.poste?.idPoste,
      appId: affectation.application?.idApp
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
