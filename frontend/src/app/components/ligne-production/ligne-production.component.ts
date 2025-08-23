import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';

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
  filteredLignes: LigneProduction[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/ligneproductions';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.ligneForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadLignes();
    this.loadUsers();
  }

  initializeSearchFields() {
    this.searchFields = [
      'idLigne', 'nom', 'user.username', 'user.prenom'
    ];
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
          this.filteredLignes = [...data];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des lignes de production';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  loadCurrentUser() {
    this.http.get<any>(this.currentUserApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.currentUser = response.user;
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'utilisateur actuel:', err);
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
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const ligneData: any = {
        nom: this.ligneForm.get('nom')?.value
      };
      
      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        ligneData.user = { matricule: this.currentUser.matricule };
      }
      
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
          // Assigner les détails de l'utilisateur actuel à la nouvelle ligne
          if (this.currentUser && newLigne) {
            newLigne.user = this.currentUser;
          }
          this.lignes.push(newLigne);
          this.applyCurrentFilters();
          this.closeModal();
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
            // Préserver l'utilisateur créateur original
            const originalUser = this.lignes[index].user;
            if (updatedLigne && originalUser) {
              updatedLigne.user = originalUser;
            }
            this.lignes[index] = updatedLigne;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Ligne mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de la ligne';
          console.error('Erreur:', err);
        }
      });
  }

  openAddModal() {
    this.showModal = true;
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  editLigne(ligne: LigneProduction) {
    this.isEditing = true;
    this.editingId = ligne.idLigne || null;
    this.showModal = true;
    this.ligneForm.patchValue({
      nom: ligne.nom
    });
  }

  deleteLigne(id?: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne de production ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.lignes = this.lignes.filter(l => l.idLigne !== id);
            this.applyCurrentFilters();
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

  onSearchChange(searchValue: string) {
    this.filteredLignes = this.searchFilterService.globalSearch(
      this.lignes,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredLignes = [...this.lignes];
  }

  private applyCurrentFilters() {
    this.filteredLignes = this.searchFilterService.applyMultipleFilters(
      this.lignes, 
      this.activeFilters
    );
  }
}
