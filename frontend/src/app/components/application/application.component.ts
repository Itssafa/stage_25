import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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
}

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  applicationForm: FormGroup;
  applications: Application[] = [];
  operations: Operation[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/applications';
  private operationApiUrl = 'http://localhost:8085/api/operations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.applicationForm = this.fb.group({
      nomApp: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      operationId: ['']
    });
  }

  ngOnInit() {
    this.loadApplications();
    this.loadOperations();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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

  loadApplications() {
    this.loading = true;
    this.error = '';
    
    this.http.get<Application[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.applications = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des applications';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.applicationForm.valid) {
      const operationId = this.applicationForm.get('operationId')?.value;
      const applicationData: any = {
        nomApp: this.applicationForm.get('nomApp')?.value,
        description: this.applicationForm.get('description')?.value
      };
      
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
          this.applications.push(newApplication);
          this.resetForm();
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
            this.applications[index] = updatedApplication;
          }
          this.resetForm();
          console.log('Application mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'application';
          console.error('Erreur:', err);
        }
      });
  }

  editApplication(application: Application) {
    this.isEditing = true;
    this.editingId = application.idApp || null;
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
}
