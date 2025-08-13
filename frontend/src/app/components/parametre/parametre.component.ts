import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Operation {
  idOp: number;
  libelle: string;
  temps: number;
}

interface Parametre {
  idParametre?: number;
  nom: string;
  valeur: string;
  operation?: Operation;
}

@Component({
  selector: 'app-parametre',
  templateUrl: './parametre.component.html',
  styleUrls: ['./parametre.component.css']
})
export class ParametreComponent implements OnInit {
  parametreForm: FormGroup;
  parametres: Parametre[] = [];
  operations: Operation[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/parametres';
  private operationApiUrl = 'http://localhost:8085/api/operations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.parametreForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      valeur: ['', [Validators.required]],
      operationId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadParametres();
    this.loadOperations();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
        valeur: this.parametreForm.get('valeur')?.value,
        operation: { idOp: this.parametreForm.get('operationId')?.value }
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
          const index = this.parametres.findIndex(p => p.idParametre === id);
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
    this.editingId = parametre.idParametre || null;
    this.parametreForm.patchValue({
      nom: parametre.nom,
      valeur: parametre.valeur,
      operationId: parametre.operation?.idOp
    });
  }

  deleteParametre(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.parametres = this.parametres.filter(p => p.idParametre !== id);
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
