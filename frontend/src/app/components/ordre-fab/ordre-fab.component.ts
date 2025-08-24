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
    
    // Vérification périodique des statuts (toutes les 5 minutes)
    setInterval(() => {
      this.checkAndUpdateStatusesPeriodically();
    }, 5 * 60 * 1000); // 5 minutes
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
          
          // Vérifier et mettre à jour automatiquement les statuts
          this.checkAndUpdateStatuses(data);
          
          this.filteredOrdresFab = [...this.ordresFab];
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
    
    // S'assurer que tous les champs sont activés pour la création
    this.enableAllFields();
    
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
    
    // Appliquer les restrictions selon le statut
    this.applyStatusBasedRestrictions(ordreFab.statuts);
    
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
    
    // Réactiver tous les champs (au cas où ils auraient été désactivés)
    this.enableAllFields();
    
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

  /**
   * Vérifie et met à jour automatiquement les statuts des ordres de fabrication
   * selon leurs dates de début et de fin
   */
  private checkAndUpdateStatuses(ordresFab: OrdreFab[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliser à 00:00 pour comparer uniquement les dates
    
    const ordersToStartUpdate: { ordre: OrdreFab, newStatus: string }[] = [];
    const ordersToFinishUpdate: { ordre: OrdreFab, newStatus: string }[] = [];
    
    ordresFab.forEach(ordre => {
      // Changement de EN_ATTENTE vers EN_COURS quand la date de début est atteinte
      if (ordre.statuts === 'EN_ATTENTE' && ordre.datedeb) {
        const dateDebut = new Date(ordre.datedeb);
        dateDebut.setHours(0, 0, 0, 0);
        
        if (dateDebut <= today) {
          ordersToStartUpdate.push({ ordre, newStatus: 'EN_COURS' });
        }
      }
      
      // Changement de EN_COURS vers TERMINEE quand la date de fin est atteinte
      if (ordre.statuts === 'EN_COURS' && ordre.datefin) {
        const dateFin = new Date(ordre.datefin);
        dateFin.setHours(0, 0, 0, 0);
        
        if (dateFin <= today) {
          ordersToFinishUpdate.push({ ordre, newStatus: 'TERMINEE' });
        }
      }
    });
    
    // Mettre à jour les ordres qui doivent commencer
    ordersToStartUpdate.forEach(({ ordre, newStatus }) => {
      this.updateOrderStatus(ordre.id_orf!, newStatus);
    });
    
    // Mettre à jour les ordres qui doivent se terminer
    ordersToFinishUpdate.forEach(({ ordre, newStatus }) => {
      this.updateOrderStatus(ordre.id_orf!, newStatus);
    });
  }

  /**
   * Met à jour le statut d'un ordre de fabrication
   */
  private updateOrderStatus(orderId: number, newStatus: string) {
    const updateData = { statuts: newStatus };
    
    this.http.put<OrdreFab>(`${this.apiUrl}/${orderId}`, updateData, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedOrder) => {
          // Mettre à jour l'ordre dans la liste locale
          const index = this.ordresFab.findIndex(o => o.id_orf === orderId);
          if (index !== -1) {
            this.ordresFab[index] = updatedOrder;
            this.filteredOrdresFab = [...this.ordresFab];
          }
          console.log(`Ordre ${orderId} automatiquement mis à jour vers ${newStatus}`);
        },
        error: (err) => {
          console.error(`Erreur lors de la mise à jour automatique du statut pour l'ordre ${orderId}:`, err);
        }
      });
  }

  /**
   * Applique les restrictions sur les champs selon le statut de l'ordre
   * - EN_ATTENTE : tous les champs sont modifiables
   * - EN_COURS : seuls quantité et date fin sont modifiables
   * - FINI/ANNULE : AUCUN champ n'est modifiable (ordre figé)
   */
  private applyStatusBasedRestrictions(statuts: string) {
    const codeField = this.ordreFabForm.get('code_fab');
    const datedebutField = this.ordreFabForm.get('datedeb');
    const produitField = this.ordreFabForm.get('produitId');
    const quantiteField = this.ordreFabForm.get('quantite');
    const datefinField = this.ordreFabForm.get('datefin');
    const statutField = this.ordreFabForm.get('statuts');
    
    if (statuts === 'EN_ATTENTE') {
      // Tous les champs sont modifiables
      codeField?.enable();
      datedebutField?.enable();
      produitField?.enable();
      quantiteField?.enable();
      datefinField?.enable();
      statutField?.enable();
    } else if (statuts === 'EN_COURS') {
      // Seuls quantité et date fin sont modifiables
      codeField?.disable();
      datedebutField?.disable();
      produitField?.disable();
      quantiteField?.enable();
      datefinField?.enable();
      statutField?.enable();
    } else {
      // FINI ou ANNULE : AUCUN champ n'est modifiable (ordre complètement figé)
      codeField?.disable();
      datedebutField?.disable();
      produitField?.disable();
      quantiteField?.disable();
      datefinField?.disable();
      statutField?.disable();
    }
  }

  /**
   * Retourne si un champ est modifiable selon le statut actuel
   */
  isFieldEditable(fieldName: string, statuts: string): boolean {
    if (statuts === 'EN_ATTENTE') {
      return true; // Tous les champs sont modifiables
    } else if (statuts === 'EN_COURS') {
      return fieldName === 'quantite' || fieldName === 'datefin' || fieldName === 'statuts';
    } else {
      return false; // AUCUN champ n'est modifiable pour FINI/ANNULE (ordre figé)
    }
  }

  /**
   * Active tous les champs du formulaire
   */
  private enableAllFields() {
    this.ordreFabForm.get('code_fab')?.enable();
    this.ordreFabForm.get('datedeb')?.enable();
    this.ordreFabForm.get('produitId')?.enable();
    this.ordreFabForm.get('quantite')?.enable();
    this.ordreFabForm.get('datefin')?.enable();
    this.ordreFabForm.get('statuts')?.enable();
  }

  /**
   * Vérification périodique des statuts (version simplifiée)
   * Ne fait que recharger les données pour éviter les conflits
   */
  private checkAndUpdateStatusesPeriodically() {
    if (!this.showModal && !this.loading) {
      this.loadOrdresFab();
    }
  }

  private applyCurrentFilters() {
    this.filteredOrdresFab = this.searchFilterService.applyMultipleFilters(
      this.ordresFab, 
      this.activeFilters
    );
  }
}
