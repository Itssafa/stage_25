import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';


interface Operation {
  id: number;
  nomOp: string;
  description: string;
  parametre: string;
}

interface Application {
  idApp?: number;
  nomApp: string;
  description: string;
  operation?: Operation;
  user?: User;
  currentlyAffected?: boolean;
  currentPosteId?: number;
  currentPosteNom?: string;
  currentAffectationDate?: string;
}

interface Poste {
  idPoste: number;
  nom: string;
  configured?: boolean;
}

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  applicationForm: FormGroup;
  applications: Application[] = [];
  filteredApplications: Application[] = [];
  operations: Operation[] = [];
  postes: Poste[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  showAffectationModal = false;
  selectedApplicationId: number | null = null;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/applications';
  private operationApiUrl = 'http://localhost:8085/api/operations';
  private posteApiUrl = 'http://localhost:8085/api/postes';
  private affectationApiUrl = 'http://localhost:8085/api/affectations';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.applicationForm = this.fb.group({
      nomApp: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      operationId: ['']
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadApplications();
    this.loadOperations();
    this.loadPostes();
  }

  initializeSearchFields() {
    this.searchFields = [
      'idApp', 'nomApp', 'description', 'operation.nomOp', 
      'user.username', 'user.prenom', 'currentPosteNom'
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

  loadOperations() {
    this.http.get<Operation[]>(this.operationApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.operations = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des opérations:', err);
        }
      });
  }

  loadPostes() {
    this.http.get<Poste[]>(this.posteApiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.postes = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des postes:', err);
        }
      });
  }

  loadApplications() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Application[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.applications = data;
          this.filteredApplications = [...data];
          // Charger l'état d'affectation de chaque application
          this.loadApplicationsAffectationStatus();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des applications';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  loadApplicationsAffectationStatus() {
    this.applications.forEach(app => {
      if (app.idApp) {
        this.http.get<boolean>(`${this.affectationApiUrl}/application/${app.idApp}/affected`, { headers: this.getHeaders() })
          .subscribe({
            next: (isAffected) => {
              app.currentlyAffected = isAffected;
              
              // Si affectée, récupérer les détails de l'affectation
              if (isAffected && app.idApp) {
                this.http.get<any>(`${this.affectationApiUrl}/application/${app.idApp}/active`, { headers: this.getHeaders() })
                  .subscribe({
                    next: (affectation) => {
                      if (affectation) {
                        app.currentPosteId = affectation.poste?.idPoste;
                        app.currentPosteNom = affectation.poste?.nom;
                        app.currentAffectationDate = affectation.dateDebut;
                      }
                    },
                    error: (err) => console.error('Erreur lors du chargement des détails d\'affectation:', err)
                  });
              }
            },
            error: (err) => console.error('Erreur lors de la vérification d\'affectation:', err)
          });
      }
    });
  }

  onSubmit() {
    if (this.applicationForm.valid) {
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const operationId = this.applicationForm.get('operationId')?.value;
      const applicationData: any = {
        nomApp: this.applicationForm.get('nomApp')?.value,
        description: this.applicationForm.get('description')?.value
      };
      
      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        applicationData.user = { matricule: this.currentUser.matricule };
      }
      
      // Ajouter l'opération si sélectionnée
      if (operationId) {
        applicationData.operation = { id: operationId };
      }
      
      if (this.isEditing && this.editingId) {
        this.updateApplication(this.editingId, applicationData);
      } else {
        this.createApplication(applicationData);
      }
    }
  }

  createApplication(application: any) {
    this.http.post<Application>(this.apiUrl, application, { headers: this.getHeaders() })
      .subscribe({
        next: (newApplication) => {
          // Assigner les détails de l'utilisateur actuel à la nouvelle application
          if (this.currentUser && newApplication) {
            newApplication.user = this.currentUser;
          }
          this.applications.push(newApplication);
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Application créée avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de l\'application';
          console.error('Erreur:', err);
        }
      });
  }

  updateApplication(id: number, application: any) {
    this.http.put<Application>(`${this.apiUrl}/${id}`, application, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedApplication) => {
          const index = this.applications.findIndex(a => a.idApp === id);
          if (index !== -1) {
            // Préserver l'utilisateur créateur original
            const originalUser = this.applications[index].user;
            if (updatedApplication && originalUser) {
              updatedApplication.user = originalUser;
            }
            this.applications[index] = updatedApplication;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Application mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'application';
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

  editApplication(application: Application) {
    this.isEditing = true;
    this.editingId = application.idApp || null;
    this.showModal = true;
    this.applicationForm.patchValue({
      nomApp: application.nomApp,
      description: application.description,
      operationId: application.operation?.id || ''
    });
  }

  deleteApplication(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.applications = this.applications.filter(a => a.idApp !== id);
            this.applyCurrentFilters();
            console.log('Application supprimée avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de l\'application';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.applicationForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }

  // Méthodes pour l'affectation
  openAffectationModal(applicationId: number) {
    this.selectedApplicationId = applicationId;
    this.showAffectationModal = true;
    // Charger les postes non configurés
    this.loadPostesDisponibles();
  }

  closeAffectationModal() {
    this.showAffectationModal = false;
    this.selectedApplicationId = null;
  }

  loadPostesDisponibles() {
    this.postes.forEach(poste => {
      this.http.get<boolean>(`${this.affectationApiUrl}/poste/${poste.idPoste}/configured`, { headers: this.getHeaders() })
        .subscribe({
          next: (isConfigured) => {
            poste.configured = isConfigured;
          },
          error: (err) => console.error('Erreur lors de la vérification de configuration du poste:', err)
        });
    });
  }

  affecterApplication(posteId: number) {
    if (!this.selectedApplicationId) return;

    this.http.post(`${this.affectationApiUrl}/affecter?applicationId=${this.selectedApplicationId}&posteId=${posteId}`, {}, 
                  { headers: this.getHeaders(), responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Application affectée avec succès');
          this.closeAffectationModal();
          this.loadApplications(); // Recharger pour mettre à jour l'état
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'affectation: ' + (err.error || 'Erreur inconnue');
          console.error('Erreur:', err);
        }
      });
  }

  desaffecterApplication(applicationId: number) {
    if (confirm('Êtes-vous sûr de vouloir désaffecter cette application ?')) {
      this.http.post(`${this.affectationApiUrl}/desaffecter/${applicationId}`, {}, 
                    { headers: this.getHeaders(), responseType: 'text' })
        .subscribe({
          next: (response) => {
            console.log('Application désaffectée avec succès');
            this.loadApplications(); // Recharger pour mettre à jour l'état
          },
          error: (err) => {
            this.error = 'Erreur lors de la désaffectation: ' + (err.error || 'Erreur inconnue');
            console.error('Erreur:', err);
          }
        });
    }
  }

  isApplicationAffectable(application: Application): boolean {
    return !application.currentlyAffected;
  }

  getAvailablePostes(): Poste[] {
    return this.postes.filter(p => !p.configured);
  }

  onSearchChange(searchValue: string) {
    this.filteredApplications = this.searchFilterService.globalSearch(
      this.applications,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredApplications = [...this.applications];
  }

  private applyCurrentFilters() {
    this.filteredApplications = this.searchFilterService.applyMultipleFilters(
      this.applications, 
      this.activeFilters
    );
  }
}
