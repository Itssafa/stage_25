import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Produit {
  idProduit: number;
  nom: string;
  type: string;
}

interface OrdreFab {
  idOrdre?: number;
  quantite: number;
  dateDebut: string;
  dateFin: string;
  produit?: Produit;
}

@Component({
  selector: 'app-ordre-fab',
  templateUrl: './ordre-fab.component.html',
  styleUrls: ['./ordre-fab.component.css']
})
export class OrdreFabComponent implements OnInit {
  ordreFabForm: FormGroup;
  ordresFab: OrdreFab[] = [];
  produits: Produit[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/ordrefabs';
  private produitApiUrl = 'http://localhost:8085/api/produits';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.ordreFabForm = this.fb.group({
      quantite: ['', [Validators.required, Validators.min(1)]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      produitId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadOrdresFab();
    this.loadProduits();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadProduits() {
    this.http.get<Produit[]>(this.produitApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.produits = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des produits:', err);
        }
      });
  }

  loadOrdresFab() {
    this.loading = true;
    this.error = '';
    
    this.http.get<OrdreFab[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.ordresFab = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des ordres de fabrication';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.ordreFabForm.valid) {
      const ordreFabData = {
        quantite: this.ordreFabForm.get('quantite')?.value,
        dateDebut: this.ordreFabForm.get('dateDebut')?.value,
        dateFin: this.ordreFabForm.get('dateFin')?.value,
        produit: { idProduit: this.ordreFabForm.get('produitId')?.value }
      };
      
      if (this.isEditing && this.editingId) {
        this.updateOrdreFab(this.editingId, ordreFabData);
      } else {
        this.createOrdreFab(ordreFabData);
      }
    }
  }

  createOrdreFab(ordreFab: any) {
    this.http.post<OrdreFab>(this.apiUrl, ordreFab, { headers: this.getHeaders() })
      .subscribe({
        next: (newOrdreFab) => {
          this.ordresFab.push(newOrdreFab);
          this.resetForm();
          console.log('Ordre de fabrication créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de l\'ordre de fabrication';
          console.error('Erreur:', err);
        }
      });
  }

  updateOrdreFab(id: number, ordreFab: any) {
    this.http.put<OrdreFab>(`${this.apiUrl}/${id}`, ordreFab, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedOrdreFab) => {
          const index = this.ordresFab.findIndex(o => o.idOrdre === id);
          if (index !== -1) {
            this.ordresFab[index] = updatedOrdreFab;
          }
          this.resetForm();
          console.log('Ordre de fabrication mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'ordre de fabrication';
          console.error('Erreur:', err);
        }
      });
  }

  editOrdreFab(ordreFab: OrdreFab) {
    this.isEditing = true;
    this.editingId = ordreFab.idOrdre || null;
    this.ordreFabForm.patchValue({
      quantite: ordreFab.quantite,
      dateDebut: ordreFab.dateDebut,
      dateFin: ordreFab.dateFin,
      produitId: ordreFab.produit?.idProduit
    });
  }

  deleteOrdreFab(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.ordresFab = this.ordresFab.filter(o => o.idOrdre !== id);
            console.log('Ordre de fabrication supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de l\'ordre de fabrication';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.ordreFabForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }
}
