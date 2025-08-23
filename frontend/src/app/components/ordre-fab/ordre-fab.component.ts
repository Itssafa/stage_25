import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';

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
  filteredOrdresFab: OrdreFab[] = [];
  produits: Produit[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  statuts: string[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/ordrefabs';
  private produitApiUrl = 'http://localhost:8085/api/produits';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active-admin-param';
  private statutApiUrl = 'http://localhost:8085/api/ordrefabs/statuts';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.ordreFabForm = this.fb.group({
      code_fab: ['', [Validators.required, Validators.minLength(3)]],
      statuts: ['EN_ATTENTE'],
      quantite: ['', [Validators.required, Validators.min(1)]],
      datedeb: ['', [Validators.required, this.dateDebutValidator]],
      datefin: ['', [Validators.required, this.dateFinValidator]],
      produitId: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadOrdresFab();
    this.loadProduits();
    this.loadUsers();
    this.loadStatuts();
  }

  initializeSearchFields() {
    this.searchFields = [
      'id_orf', 'code_fab', 'statuts', 'quantite', 'produit.nom',
      'user.username', 'user.prenom'
    ];
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
          this.filteredOrdresFab = [...data];
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
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const ordreFabData: any = {
        code_fab: this.ordreFabForm.get('code_fab')?.value,
        statuts: this.ordreFabForm.get('statuts')?.value,
        quantite: this.ordreFabForm.get('quantite')?.value,
        datedeb: this.ordreFabForm.get('datedeb')?.value,
        datefin: this.ordreFabForm.get('datefin')?.value,
        produit: { idProduit: this.ordreFabForm.get('produitId')?.value }
      };
      
      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        ordreFabData.user = { matricule: this.currentUser.matricule };
      }
      
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
          // Assigner les détails de l'utilisateur actuel au nouvel ordre
          if (this.currentUser && newOrdreFab) {
            newOrdreFab.user = this.currentUser;
          }
          this.ordresFab.push(newOrdreFab);
          this.applyCurrentFilters();
          this.closeModal();
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
            // Préserver l'utilisateur créateur original
            const originalUser = this.ordresFab[index].user;
            if (updatedOrdreFab && originalUser) {
              updatedOrdreFab.user = originalUser;
            }
            this.ordresFab[index] = updatedOrdreFab;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Ordre de fabrication mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'ordre de fabrication';
          console.error('Erreur:', err);
        }
      });
  }

  openAddModal() {
    this.showModal = true;
    this.isEditing = false;
    this.editingId = null;
    this.resetForm();
    
    // Lors de la création, retirer la validation requise du statut
    this.ordreFabForm.get('statuts')?.clearValidators();
    this.ordreFabForm.get('statuts')?.updateValueAndValidity();
    
    // S'assurer que le statut par défaut est défini
    this.ordreFabForm.patchValue({ statuts: 'EN_ATTENTE' });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  editOrdreFab(ordreFab: OrdreFab) {
    this.isEditing = true;
    this.editingId = ordreFab.id_orf || null;
    this.showModal = true;
    
    // Lors de la modification, ajouter la validation requise pour le statut
    this.ordreFabForm.get('statuts')?.setValidators([Validators.required]);
    this.ordreFabForm.get('statuts')?.updateValueAndValidity();
    
    this.ordreFabForm.patchValue({
      code_fab: ordreFab.code_fab,
      statuts: ordreFab.statuts,
      quantite: ordreFab.quantite,
      datedeb: ordreFab.datedeb,
      datefin: ordreFab.datefin,
      produitId: ordreFab.produit?.idProduit
    });
  }

  deleteOrdreFab(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ordre de fabrication ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.ordresFab = this.ordresFab.filter(o => o.id_orf !== id);
            this.applyCurrentFilters();
            console.log('Ordre de fabrication supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de l\'ordre de fabrication';
            console.error('Erreur:', err);
          }
        });
    }
  }

  // Validateur pour la date de début (ne peut pas être inférieure à aujourd'hui)
  dateDebutValidator(control: any) {
    if (!control.value) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value);
    
    if (selectedDate < today) {
      return { dateDebutInvalide: { message: 'La date de début ne peut pas être antérieure à aujourd\'hui' } };
    }
    return null;
  }

  // Validateur pour la date de fin (doit être >= aujourd'hui)
  dateFinValidator(control: any) {
    if (!control.value) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value);
    
    if (selectedDate < today) {
      return { dateFinInvalide: { message: 'La date de fin ne peut pas être antérieure à aujourd\'hui' } };
    }
    return null;
  }

  // Validateur pour vérifier que la date de fin >= date de début
  dateRangeValidator(group: any) {
    const datedeb = group.get('datedeb');
    const datefin = group.get('datefin');
    
    if (!datedeb?.value || !datefin?.value) return null;
    
    const dateDebut = new Date(datedeb.value);
    const dateFin = new Date(datefin.value);
    
    if (dateFin < dateDebut) {
      return { dateRangeInvalide: { message: 'La date de fin doit être postérieure ou égale à la date de début' } };
    }
    return null;
  }

  resetForm() {
    this.ordreFabForm.reset();
    // Réinitialiser le statut par défaut
    this.ordreFabForm.patchValue({ statuts: 'EN_ATTENTE' });
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }

  onSearchChange(searchValue: string) {
    this.filteredOrdresFab = this.searchFilterService.globalSearch(
      this.ordresFab,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredOrdresFab = [...this.ordresFab];
  }

  private applyCurrentFilters() {
    this.filteredOrdresFab = this.searchFilterService.applyMultipleFilters(
      this.ordresFab, 
      this.activeFilters
    );
  }
}
