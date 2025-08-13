import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Application {
  idApplication?: number;
  nom: string;
  
}

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  applicationForm: FormGroup;
  applications: Application[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/applications';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.applicationForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      version: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    this.loadApplications();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
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
      const applicationData = {
        nom: this.applicationForm.get('nom')?.value,
        version: this.applicationForm.get('version')?.value
      };
      
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
          const index = this.applications.findIndex(a => a.idApplication === id);
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
    this.editingId = application.idApplication || null;
    this.applicationForm.patchValue({
      nom: application.nom
        });
  }

  deleteApplication(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.applications = this.applications.filter(a => a.idApplication !== id);
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
