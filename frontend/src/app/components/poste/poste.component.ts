import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';

interface LigneProduction {
  idLigne: number;
  nom: string;
}

interface Application {
  idApp: number;
  nomApp: string;
  description: string;
}

interface Parametre {
  idParam?: number;
  nom: string;
  description?: string;
  valeur?: string;
  affectation?: {
    idAffectation: number;
  };
}

interface Poste {
  idPoste?: number;
  nom: string;
  ligne?: LigneProduction;
  user?: User;
  etat?: 'CONFIGURE' | 'NON_CONFIGURE';
}

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.css']
})
export class PosteComponent implements OnInit, OnDestroy {
  posteForm: FormGroup;
  postes: Poste[] = [];
  filteredPostes: Poste[] = [];
  lignes: LigneProduction[] = [];
  applications: { [key: number]: Application[] } = {};
  parametres: { [key: number]: Parametre[] } = {};
  currentUser: User | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  selectedPosteId: number | null = null;
  showModal = false;
  showParametersModal = false;
  selectedPosteForParameters: Poste | null = null;
  parametreForm: FormGroup;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private destroy$ = new Subject<void>();
  
  private apiUrl = 'http://localhost:8085/api/postes';
  private ligneApiUrl = 'http://localhost:8085/api/ligneproductions';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';
  private parametreApiUrl = 'http://localhost:8085/api/parametres';
  private affectationApiUrl = 'http://localhost:8085/api/affectations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.posteForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      ligneId: ['', [Validators.required]]
    });
    
    this.parametreForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      valeur: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadPostes();
    this.loadLignes();
  }

  initializeSearchFields() {
    this.searchFields = [
      'idPoste', 'nom', 'ligne.nom', 'ligne.idLigne',
      'user.username', 'user.prenom', 'etat'
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
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            message: err.message,
            error: err.error
          });
          console.error('Full error object:', err);
          if (err.error && err.error.text) {
            console.error('Response text that failed to parse:', err.error.text.substring(0, 1000));
          }
          this.error = 'Erreur lors du chargement des lignes de production';
        }
      });
  }

  loadPostes() {
    this.loading = true;
    this.error = '';
    
    const headers = this.getHeaders();
    if (!headers.get('Authorization') || headers.get('Authorization') === 'Bearer null') {
      this.error = 'Token manquant ou invalide';
      this.loading = false;
      return;
    }
    
    this.http.get<Poste[]>(this.apiUrl, { headers })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.postes = data || [];
          this.filteredPostes = [...this.postes];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des postes';
          this.loading = false;
          console.error('Erreur:', err);
          console.error('Error details:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            message: err.message,
            error: err.error
          });
          console.error('Full error object:', err);
          if (err.error && err.error.text) {
            console.error('Response text that failed to parse:', err.error.text.substring(0, 1000));
          }
        }
      });
  }

  onSubmit() {
    if (this.posteForm.valid) {
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const posteData: any = {
        nom: this.posteForm.get('nom')?.value,
        ligne: { idLigne: this.posteForm.get('ligneId')?.value }
      };
      
      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        posteData.user = { matricule: this.currentUser.matricule };
      }
      
      if (this.isEditing && this.editingId) {
        this.updatePoste(this.editingId, posteData);
      } else {
        this.createPoste(posteData);
      }
    }
  }

  createPoste(poste: any) {
    poste.etat = 'NON_CONFIGURE';
    
    this.http.post<Poste>(this.apiUrl, poste, { headers: this.getHeaders() })
      .subscribe({
        next: (newPoste) => {
          // Assigner les détails de l'utilisateur actuel au nouveau poste
          if (this.currentUser && newPoste) {
            newPoste.user = this.currentUser;
            newPoste.etat = 'NON_CONFIGURE';
          }
          this.postes.push(newPoste);
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Poste créé avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du poste';
          console.error('Erreur:', err);
        }
      });
  }

  updatePoste(id: number, poste: any) {
    this.http.put<Poste>(`${this.apiUrl}/${id}`, poste, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedPoste) => {
          const index = this.postes.findIndex(p => p.idPoste === id);
          if (index !== -1) {
            // Préserver l'utilisateur créateur original
            const originalUser = this.postes[index].user;
            if (updatedPoste && originalUser) {
              updatedPoste.user = originalUser;
            }
            this.postes[index] = updatedPoste;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Poste mis à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du poste';
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

  editPoste(poste: Poste) {
    this.isEditing = true;
    this.editingId = poste.idPoste || null;
    this.showModal = true;
    this.posteForm.patchValue({
      nom: poste.nom,
      ligneId: poste.ligne?.idLigne
    });
  }

  deletePoste(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.postes = this.postes.filter(p => p.idPoste !== id);
            this.applyCurrentFilters();
            console.log('Poste supprimé avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression du poste';
            console.error('Erreur:', err);
          }
        });
    }
  }

  loadApplicationsByPoste(posteId: number) {
    this.http.get<Application[]>(`${this.apiUrl}/${posteId}/applications`, { headers: this.getHeaders() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.applications[posteId] = data || [];
        },
        error: (err) => {
          console.error('Erreur lors du chargement des applications du poste:', err);
          this.applications[posteId] = [];
        }
      });
  }

  toggleApplications(posteId: number) {
    if (this.selectedPosteId === posteId) {
      this.selectedPosteId = null;
    } else {
      this.selectedPosteId = posteId;
      if (!this.applications[posteId]) {
        this.loadApplicationsByPoste(posteId);
      }
      // Charger aussi les paramètres du poste s'il est configuré
      const poste = this.postes.find(p => p.idPoste === posteId);
      if (poste && poste.etat === 'CONFIGURE' && !this.parametres[posteId]) {
        this.loadParametresByPoste(posteId);
      }
    }
  }

  resetForm() {
    this.posteForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }

  onSearchChange(searchValue: string) {
    this.filteredPostes = this.searchFilterService.globalSearch(
      this.postes,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredPostes = [...this.postes];
  }


  voirParametres(poste: Poste) {
    this.selectedPosteForParameters = poste;
    this.showParametersModal = true;
    this.loadParametresByPoste(poste.idPoste!);
  }

  loadParametresByPoste(posteId: number) {
    // D'abord, récupérer l'affectation active du poste
    this.http.get<any>(`${this.affectationApiUrl}/poste/${posteId}/active`, { headers: this.getHeaders() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (affectation) => {
          if (affectation && affectation.idAffectation) {
            // Ensuite, récupérer les paramètres de cette affectation
            this.http.get<Parametre[]>(`${this.parametreApiUrl}?affectationId=${affectation.idAffectation}`, { headers: this.getHeaders() })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (parametres) => {
                  this.parametres[posteId] = parametres || [];
                },
                error: (err) => {
                  console.error('Erreur lors du chargement des paramètres:', err);
                  this.parametres[posteId] = [];
                }
              });
          } else {
            this.parametres[posteId] = [];
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'affectation:', err);
          this.parametres[posteId] = [];
        }
      });
  }

  closeParametersModal() {
    this.showParametersModal = false;
    this.selectedPosteForParameters = null;
    this.resetParametreForm();
  }

  onParametreSubmit() {
    if (this.parametreForm.valid && this.selectedPosteForParameters) {
      // D'abord, récupérer l'affectation active du poste
      this.http.get<any>(`${this.affectationApiUrl}/poste/${this.selectedPosteForParameters.idPoste}/active`, { headers: this.getHeaders() })
        .subscribe({
          next: (affectation) => {
            if (affectation && affectation.idAffectation) {
              const parametreData = {
                nom: this.parametreForm.get('nom')?.value,
                description: this.parametreForm.get('description')?.value,
                valeur: this.parametreForm.get('valeur')?.value,
                affectation: { idAffectation: affectation.idAffectation }
              };
              
              this.createParametre(parametreData);
            }
          },
          error: (err) => {
            console.error('Erreur lors de la récupération de l\'affectation:', err);
          }
        });
    }
  }

  createParametre(parametre: any) {
    this.http.post<Parametre>(this.parametreApiUrl, parametre, { headers: this.getHeaders() })
      .subscribe({
        next: (newParametre) => {
          if (this.selectedPosteForParameters) {
            if (!this.parametres[this.selectedPosteForParameters.idPoste!]) {
              this.parametres[this.selectedPosteForParameters.idPoste!] = [];
            }
            this.parametres[this.selectedPosteForParameters.idPoste!].push(newParametre);
          }
          this.resetParametreForm();
          console.log('Paramètre créé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la création du paramètre:', err);
        }
      });
  }

  editParametre(parametre: Parametre) {
    this.parametreForm.patchValue({
      nom: parametre.nom,
      description: parametre.description || '',
      valeur: parametre.valeur || ''
    });
  }

  deleteParametre(parametreId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paramètre ?')) {
      this.http.delete(`${this.parametreApiUrl}/${parametreId}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            if (this.selectedPosteForParameters) {
              const posteId = this.selectedPosteForParameters.idPoste!;
              this.parametres[posteId] = this.parametres[posteId].filter(p => p.idParam !== parametreId);
            }
            console.log('Paramètre supprimé avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du paramètre:', err);
          }
        });
    }
  }

  resetParametreForm() {
    this.parametreForm.reset();
  }

  private applyCurrentFilters() {
    this.filteredPostes = this.searchFilterService.applyMultipleFilters(
      this.postes, 
      this.activeFilters
    );
  }
}
