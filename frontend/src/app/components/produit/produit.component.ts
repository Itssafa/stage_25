import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../models/user.model';

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
  lignes: LigneProduction[] = [];
  users: User[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private destroy$ = new Subject<void>();

  // Liste des types pour le select HTML
  typeOptions = Object.values(TypeProduit);

  private apiUrl = 'http://localhost:8085/api/produits';
  private ligneApiUrl = 'http://localhost:8085/api/ligneproductions';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required]], // plus de minLength ici
      code: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      ligneId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadProduits();
    this.loadLignes();
    this.loadUsers();
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
      const produitData = {
        nom: this.produitForm.get('nom')?.value,
        code: this.produitForm.get('code')?.value,
        type: this.produitForm.get('type')?.value,
        user: { matricule: this.produitForm.get('userId')?.value },
        ligne: { idLigne: this.produitForm.get('ligneId')?.value }
      };

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
          this.produits.push(newProduit);
          this.resetForm();
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
            this.produits[index] = updatedProduit;
          }
          this.resetForm();
          console.log('Produit mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du produit';
          console.error('Erreur:', err);
        }
      });
  }

  editProduit(produit: Produit) {
    this.isEditing = true;
    this.editingId = produit.idProduit || null;
    this.produitForm.patchValue({
      nom: produit.nom,
      code: produit.code,
      type: produit.type,
      userId: produit.user?.matricule,
      ligneId: produit.ligne?.idLigne
    });
  }

  deleteProduit(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.produits = this.produits.filter(p => p.idProduit !== id);
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
}
