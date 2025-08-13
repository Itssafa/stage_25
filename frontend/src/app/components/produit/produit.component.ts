import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  type: TypeProduit;
  ligne?: LigneProduction;
}

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css']
})
export class ProduitComponent implements OnInit {
  produitForm: FormGroup;
  produits: Produit[] = [];
  lignes: LigneProduction[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;

  // Liste des types pour le select HTML
  typeOptions = Object.values(TypeProduit);

  private apiUrl = 'http://localhost:8085/api/produits';
  private ligneApiUrl = 'http://localhost:8085/api/ligneproductions';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required]], // plus de minLength ici
      ligneId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadProduits();
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

  loadProduits() {
    this.loading = true;
    this.error = '';

    this.http.get<Produit[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.produits = data;
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
        type: this.produitForm.get('type')?.value,
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
