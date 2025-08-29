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

interface LigneProduction {
  idLigne: number;
  nom: string;
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
  ligneProduction?: LigneProduction;
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
  lignesProduction: LigneProduction[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  statuts: string[] = [];
  availabilityCheckResult: any = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  showDateConfirmModal = false;
  proposedStartDate: string | null = null;
  pendingOrderId: number | null = null;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/ordrefabs';
  private produitApiUrl = 'http://localhost:8085/api/produits';
  private ligneProductionApiUrl = 'http://localhost:8085/api/ligneproductions';
  private userApiUrl = 'http://localhost:8085/api/admin/user-management/active-admin-param';
  private statutApiUrl = 'http://localhost:8085/api/ordrefabs/statuts';
  private availabilityApiUrl = 'http://localhost:8085/api/ordrefabs/check-availability';
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
      produitId: ['', [Validators.required]],
      ligneProductionId: ['', [Validators.required]]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadOrdresFab();
    this.loadProduits();
    this.loadLignesProduction();
    this.loadUsers();
    this.loadStatuts();
    this.setupAvailabilityValidation();
    
    // Vérification périodique des statuts (toutes les 5 minutes)
    setInterval(() => {
      this.checkAndUpdateStatusesPeriodically();
    }, 5 * 60 * 1000); // 5 minutes
  }

  initializeSearchFields() {
    this.searchFields = [
      'id_orf', 'code_fab', 'statuts', 'quantite', 'produit.nom',
      'user.username', 'user.prenom', 'datedeb', 'datefin', 'ligneProduction.nom'
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

  loadLignesProduction() {
    this.http.get<LigneProduction[]>(this.ligneProductionApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.lignesProduction = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des lignes de production:', err);
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
        produit: { idProduit: this.ordreFabForm.get('produitId')?.value },
        ligneProduction: { idLigne: this.ordreFabForm.get('ligneProductionId')?.value }
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
      produitId: ordreFab.produit?.idProduit,
      ligneProductionId: ordreFab.ligneProduction?.idLigne
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
    const ligneField = this.ordreFabForm.get('ligneProductionId');
    const quantiteField = this.ordreFabForm.get('quantite');
    const datefinField = this.ordreFabForm.get('datefin');
    const statutField = this.ordreFabForm.get('statuts');
    
    if (statuts === 'EN_ATTENTE') {
      // Tous les champs sont modifiables
      codeField?.enable();
      datedebutField?.enable();
      produitField?.enable();
      ligneField?.enable();
      quantiteField?.enable();
      datefinField?.enable();
      statutField?.enable();
    } else if (statuts === 'EN_COURS') {
      // Seuls quantité et date fin sont modifiables
      codeField?.disable();
      datedebutField?.disable();
      produitField?.disable();
      ligneField?.disable();
      quantiteField?.enable();
      datefinField?.enable();
      statutField?.disable();
    } else {
      // FINI ou ANNULE : AUCUN champ n'est modifiable (ordre complètement figé)
      codeField?.disable();
      datedebutField?.disable();
      produitField?.disable();
      ligneField?.disable();
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
      return fieldName === 'quantite' || fieldName === 'datefin';
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
    this.ordreFabForm.get('ligneProductionId')?.enable();
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

  setupAvailabilityValidation() {
    const ligneField = this.ordreFabForm.get('ligneProductionId');
    const dateDebutField = this.ordreFabForm.get('datedeb');
    const dateFinField = this.ordreFabForm.get('datefin');

    // Vérifier la disponibilité quand les champs changent
    [ligneField, dateDebutField, dateFinField].forEach(field => {
      field?.valueChanges.subscribe(() => {
        this.checkAvailability();
      });
    });
  }

  checkAvailability() {
    const ligneId = this.ordreFabForm.get('ligneProductionId')?.value;
    const dateDebut = this.ordreFabForm.get('datedeb')?.value;
    const dateFin = this.ordreFabForm.get('datefin')?.value;

    if (ligneId && dateDebut && dateFin) {
      const params = {
        ligneId: ligneId,
        dateDebut: dateDebut,
        dateFin: dateFin,
        ...(this.isEditing && this.editingId ? { excludeOrderId: this.editingId } : {})
      };

      this.http.get<any>(this.availabilityApiUrl, { 
        headers: this.getHeaders(),
        params: params
      }).subscribe({
        next: (result) => {
          this.availabilityCheckResult = result;
          
          if (!result.available) {
            this.ordreFabForm.get('ligneProductionId')?.setErrors({ 
              ligneNotAvailable: { 
                message: 'Cette ligne de production n\'est pas disponible pour cette période',
                conflictingOrders: result.conflictingOrders
              }
            });
          } else {
            // Supprimer l'erreur de disponibilité si elle existe
            const currentErrors = this.ordreFabForm.get('ligneProductionId')?.errors;
            if (currentErrors && currentErrors['ligneNotAvailable']) {
              delete currentErrors['ligneNotAvailable'];
              const hasOtherErrors = Object.keys(currentErrors).length > 0;
              this.ordreFabForm.get('ligneProductionId')?.setErrors(hasOtherErrors ? currentErrors : null);
            }
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification de disponibilité:', err);
        }
      });
    } else {
      this.availabilityCheckResult = null;
    }
  }

  getConflictingOrdersMessage(): string {
    if (!this.availabilityCheckResult || this.availabilityCheckResult.available) {
      return '';
    }
    
    const orders = this.availabilityCheckResult.conflictingOrders || [];
    if (orders.length === 0) {
      return 'Ligne non disponible pour cette période';
    }
    
    const ordersList = orders.map((order: any) => 
      `${order.code_fab} (${order.datedeb} - ${order.datefin})`
    ).join(', ');
    
    return `Conflit avec: ${ordersList}`;
  }

  cancelOrder(orderId: number) {
    if (confirm('Êtes-vous sûr de vouloir annuler cet ordre de fabrication ?')) {
      const token = localStorage.getItem('token');
      console.log('Token disponible:', !!token);
      console.log('Headers envoyés:', this.getHeaders());
      console.log('URL appelée:', `${this.apiUrl}/${orderId}/cancel`);
      
      this.http.put<any>(`${this.apiUrl}/${orderId}/cancel`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            if (response.success && response.ordre) {
              const index = this.ordresFab.findIndex(o => o.id_orf === orderId);
              if (index !== -1) {
                this.ordresFab[index] = response.ordre;
              }
              this.applyCurrentFilters();
              console.log('Ordre annulé avec succès');
            }
          },
          error: (err) => {
            this.error = 'Erreur lors de l\'annulation de l\'ordre de fabrication: ' + (err.error?.message || err.message || 'Erreur inconnue');
            console.error('Erreur détaillée:', err);
            console.error('Status:', err.status);
            console.error('Error body:', err.error);
          }
        });
    }
  }

  startOrderToday(orderId: number) {
    if (confirm('Êtes-vous sûr de vouloir démarrer cet ordre aujourd\'hui ?')) {
      this.http.put<any>(`${this.apiUrl}/${orderId}/start-today`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: (result) => {
            if (result.success) {
              // Ordre démarré avec succès aujourd'hui
              const index = this.ordresFab.findIndex(o => o.id_orf === orderId);
              if (index !== -1) {
                this.ordresFab[index] = result.ordre;
              }
              this.applyCurrentFilters();
              console.log('Ordre démarré avec succès');
            } else if (result.needsNewDate) {
              // Proposer une nouvelle date
              this.proposedStartDate = result.nextAvailableDate;
              this.pendingOrderId = orderId;
              this.showDateConfirmModal = true;
            }
          },
          error: (err) => {
            this.error = 'Erreur lors du démarrage de l\'ordre de fabrication: ' + (err.error?.message || err.message || 'Erreur inconnue');
            console.error('Erreur détaillée:', err);
            console.error('Status:', err.status);
            console.error('Error body:', err.error);
          }
        });
    }
  }

  confirmStartOnNewDate() {
    if (!this.pendingOrderId || !this.proposedStartDate) return;

    this.http.put<any>(
      `${this.apiUrl}/${this.pendingOrderId}/start-on-date`, 
      {}, 
      { 
        headers: this.getHeaders(),
        params: { newStartDate: this.proposedStartDate }
      }
    ).subscribe({
      next: (result) => {
        if (result.success) {
          const index = this.ordresFab.findIndex(o => o.id_orf === this.pendingOrderId);
          if (index !== -1) {
            this.ordresFab[index] = result.ordre;
          }
          this.applyCurrentFilters();
          console.log('Ordre reprogrammé et démarré avec succès');
        }
        this.closeDateConfirmModal();
      },
      error: (err) => {
        this.error = 'Erreur lors de la reprogrammation de l\'ordre de fabrication';
        console.error('Erreur:', err);
        this.closeDateConfirmModal();
      }
    });
  }

  closeDateConfirmModal() {
    this.showDateConfirmModal = false;
    this.proposedStartDate = null;
    this.pendingOrderId = null;
  }
}
