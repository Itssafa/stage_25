import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Affectation {
  idAffectation: number;
  poste?: {
    idPoste: number;
    nom: string;
  };
  application?: {
    idApplication: number;
    nom: string;
  };
}

interface Parametre {
  idParam?: number;
  nom: string;
  description?: string;
  affectation?: Affectation;
}

@Component({
  selector: 'app-parametre',
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.css']
})
export class ParametreComponent implements OnInit {
  parametreForm: FormGroup;
  parametres: Parametre[] = [];
  affectations: Affectation[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/parametres';
  private affectationApiUrl = 'http://localhost:8085/api/affectations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.parametreForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      affectationId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadParametres();
    this.loadAffectations();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadAffectations() {
    this.http.get<Affectation[]>(this.affectationApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.affectations = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des affectations:', err);
        }
      });
  }

  loadParametres() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Parametre[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.parametres = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des paramètres';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.parametreForm.valid) {
      const parametreData = {
        nom: this.parametreForm.get('nom')?.value,
        affectation: { idAffectation: this.parametreForm.get('affectationId')?.value }
      };
      
      if (this.isEditing && this.editingId) {
        this.updateParametre(this.editingId, parametreData);
      } else {
        this.createParametre(parametreData);
      }
    }
  }

  createParametre(parametre: any) {
    this.http.post<Parametre>(this.apiUrl, parametre, { headers: this.getHeaders() })
      .subscribe({
        next: (newParametre) => {
          this.parametres.push(newParametre);
          this.resetForm();
          console.log('Paramètre créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du paramètre';
          console.error('Erreur:', err);
        }
      });
  }

  updateParametre(id: number, parametre: any) {
    this.http.put<Parametre>(`${this.apiUrl}/${id}`, parametre, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedParametre) => {
          const index = this.parametres.findIndex(p => p.idParam === id);
          if (index !== -1) {
            this.parametres[index] = updatedParametre;
          }
          this.resetForm();
          console.log('Paramètre mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du paramètre';
          console.error('Erreur:', err);
        }
      });
  }

  editParametre(parametre: Parametre) {
    this.isEditing = true;
    this.editingId = parametre.idParam || null;
    this.parametreForm.patchValue({
      nom: parametre.nom,
      affectationId: parametre.affectation?.idAffectation
    });
  }

  deleteParametre(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.parametres = this.parametres.filter(p => p.idParam !== id);
            console.log('Paramètre supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression du paramètre';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.parametreForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }
}
