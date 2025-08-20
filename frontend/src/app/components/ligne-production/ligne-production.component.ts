import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.model';

interface LigneProduction {
  idLigne?: number;
  nom: string;
  user?: User;
}

@Component({
  selector: 'app-ligne-production',
  templateUrl: './ligne-production.component.html',
  styleUrls: ['./ligne-production.component.css']
})
export class LigneProductionComponent implements OnInit {
  ligneForm: FormGroup;
  lignes: LigneProduction[] = [];
  users: User[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/ligneproductions';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.ligneForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      userId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadLignes();
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadLignes() {
    this.loading = true;
    this.error = '';
    
    this.http.get<LigneProduction[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.lignes = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des lignes de production';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  loadUsers() {
    this.http.get<User[]>(this.userApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data || [];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs:', err);
        }
      });
  }

  onSubmit() {
    if (this.ligneForm.valid) {
      const ligneData = {
        nom: this.ligneForm.get('nom')?.value,
        user: { matricule: this.ligneForm.get('userId')?.value }
      };
      
      if (this.isEditing && this.editingId) {
        this.updateLigne(this.editingId, ligneData);
      } else {
        this.createLigne(ligneData);
      }
    }
  }

  createLigne(ligne: any) {
    this.http.post<LigneProduction>(this.apiUrl, ligne, { headers: this.getHeaders() })
      .subscribe({
        next: (newLigne) => {
          this.lignes.push(newLigne);
          this.resetForm();
          console.log('Ligne créée avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de la ligne';
          console.error('Erreur:', err);
        }
      });
  }

  updateLigne(id: number, ligne: any) {
    this.http.put<LigneProduction>(`${this.apiUrl}/${id}`, ligne, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedLigne) => {
          const index = this.lignes.findIndex(l => l.idLigne === id);
          if (index !== -1) {
            this.lignes[index] = updatedLigne;
          }
          this.resetForm();
          console.log('Ligne mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de la ligne';
          console.error('Erreur:', err);
        }
      });
  }

  editLigne(ligne: LigneProduction) {
    this.isEditing = true;
    this.editingId = ligne.idLigne || null;
    this.ligneForm.patchValue({
      nom: ligne.nom,
      userId: ligne.user?.matricule
    });
  }

  deleteLigne(id?: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne de production ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.lignes = this.lignes.filter(l => l.idLigne !== id);
            console.log('Ligne supprimée avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de la ligne';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.ligneForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }
}
