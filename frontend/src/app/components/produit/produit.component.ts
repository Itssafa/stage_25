import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';

// === Enum TypeProduit ===
export enum TypeProduit {
  PSFINI = 'PSFINI',
  PFINI = 'PFINI',
  C_E = 'C_E',
  COMPOSANT = 'COMPOSANT'
}

interface LigneProduction {
  idLigne: number;
  nom: string;
}

interface Produit {
  idProduit?: number;
  nom: string;
  code: string;
  type: TypeProduit;
  user?: User;
  ligne?: LigneProduction;
}

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit, OnDestroy {
  produitForm: FormGroup;
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  lignes: LigneProduction[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private destroy$ = new Subject<void>();

  // Liste des types pour le select HTML
  typeOptions = Object.values(TypeProduit);

  private apiUrl = 'http://localhost:8085/api/produits';
  private ligneApiUrl = 'http://localhost:8085/api/ligneproductions';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required]], // plus de minLength ici
      code: ['', [Validators.required]],
      ligneId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadProduits();
    this.loadLignes();
    this.loadUsers();
  }

  initializeSearchFields() {
    this.searchFields = [
      'idProduit', 'nom', 'code', 'type', 'ligne.nom',
      'user.username', 'user.prenom'
    ];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
    const headers = this.getHeaders();
    if (!headers.get('Authorization') || headers.get('Authorization') === 'Bearer null') {
      console.error('Token manquant ou invalide');
      return;
    }
    
    this.http.get<User[]>(this.userApiUrl, { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.users = data || [];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs:', err);
        }
      });
  }

  loadLignes() {
    const headers = this.getHeaders();
    if (!headers.get('Authorization') || headers.get('Authorization') === 'Bearer null') {
      console.error('Token manquant ou invalide');
      return;
    }
    
    this.http.get<LigneProduction[]>(this.ligneApiUrl, { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.lignes = data || [];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des lignes:', err);
          this.error = 'Erreur lors du chargement des lignes de production';
        }
      });
  }

  loadProduits() {
    this.loading = true;
    this.error = '';

    const headers = this.getHeaders();
    if (!headers.get('Authorization') || headers.get('Authorization') === 'Bearer null') {
      this.error = 'Token manquant ou invalide';
      this.loading = false;
      return;
    }

    this.http.get<Produit[]>(this.apiUrl, { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.produits = data || [];
          this.filteredProduits = [...this.produits];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des produits';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.produitForm.valid) {
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const produitData: any = {
        nom: this.produitForm.get('nom')?.value,
        code: this.produitForm.get('code')?.value,
        type: this.produitForm.get('type')?.value,
        ligne: { idLigne: this.produitForm.get('ligneId')?.value }
      };

      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        produitData.user = { matricule: this.currentUser.matricule };
      }

      if (this.isEditing && this.editingId) {
        this.updateProduit(this.editingId, produitData);
      } else {
        this.createProduit(produitData);
      }
    }
  }

  createProduit(produit: any) {
    this.http.post<Produit>(this.apiUrl, produit, { headers: this.getHeaders() })
      .subscribe({
        next: (newProduit) => {
          // Assigner les détails de l'utilisateur actuel au nouveau produit
          if (this.currentUser && newProduit) {
            newProduit.user = this.currentUser;
          }
          this.produits.push(newProduit);
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Produit créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du produit';
          console.error('Erreur:', err);
        }
      });
  }

  updateProduit(id: number, produit: any) {
    this.http.put<Produit>(`${this.apiUrl}/${id}`, produit, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedProduit) => {
          const index = this.produits.findIndex(p => p.idProduit === id);
          if (index !== -1) {
            // Préserver l'utilisateur créateur original
            const originalUser = this.produits[index].user;
            if (updatedProduit && originalUser) {
              updatedProduit.user = originalUser;
            }
            this.produits[index] = updatedProduit;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Produit mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du produit';
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

  editProduit(produit: Produit) {
    this.isEditing = true;
    this.editingId = produit.idProduit || null;
    this.showModal = true;
    this.produitForm.patchValue({
      nom: produit.nom,
      code: produit.code,
      type: produit.type,
      ligneId: produit.ligne?.idLigne
    });
  }

  deleteProduit(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.produits = this.produits.filter(p => p.idProduit !== id);
            this.applyCurrentFilters();
            console.log('Produit supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression du produit';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.produitForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }

  onSearchChange(searchValue: string) {
    this.filteredProduits = this.searchFilterService.globalSearch(
      this.produits,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredProduits = [...this.produits];
  }

  private applyCurrentFilters() {
    this.filteredProduits = this.searchFilterService.applyMultipleFilters(
      this.produits, 
      this.activeFilters
    );
  }
}
