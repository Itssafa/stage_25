import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface User {
  matricule: number;
  username: string;
  prenom: string;
  adresseMail: string;
  role: string;
  isActive: boolean;
}

interface Produit {
  idProduit: number;
  nom: string;
  type: string;
}

interface OrdreFab {
  id_orf?: number;
  code_fab: string;
  statuts: string;
  quantite: number;
  datedeb: string;
  datefin: string;
  user?: User;
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
  users: User[] = [];
  statuts: string[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/ordrefabs';
  private produitApiUrl = 'http://localhost:8085/api/produits';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active-admin-param';
  private statutApiUrl = 'http://localhost:8085/api/ordrefabs/statuts';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.ordreFabForm = this.fb.group({
      code_fab: ['', [Validators.required, Validators.minLength(3)]],
      statuts: ['', [Validators.required]],
      quantite: ['', [Validators.required, Validators.min(1)]],
      datedeb: ['', [Validators.required]],
      datefin: ['', [Validators.required]],
      userId: ['', [Validators.required]],
      produitId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadOrdresFab();
    this.loadProduits();
    this.loadUsers();
    this.loadStatuts();
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

  loadUsers() {
    this.http.get<User[]>(this.userApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des utilisateurs:', err);
        }
      });
  }

  loadStatuts() {
    this.http.get<string[]>(this.statutApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.statuts = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statuts:', err);
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
        code_fab: this.ordreFabForm.get('code_fab')?.value,
        statuts: this.ordreFabForm.get('statuts')?.value,
        quantite: this.ordreFabForm.get('quantite')?.value,
        datedeb: this.ordreFabForm.get('datedeb')?.value,
        datefin: this.ordreFabForm.get('datefin')?.value,
        user: { matricule: this.ordreFabForm.get('userId')?.value },
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
          const index = this.ordresFab.findIndex(o => o.id_orf === id);
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
    this.editingId = ordreFab.id_orf || null;
    this.ordreFabForm.patchValue({
      code_fab: ordreFab.code_fab,
      statuts: ordreFab.statuts,
      quantite: ordreFab.quantite,
      datedeb: ordreFab.datedeb,
      datefin: ordreFab.datefin,
      userId: ordreFab.user?.matricule,
      produitId: ordreFab.produit?.idProduit
    });
  }

  deleteOrdreFab(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.ordresFab = this.ordresFab.filter(o => o.id_orf !== id);
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
