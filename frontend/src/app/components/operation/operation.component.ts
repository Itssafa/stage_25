import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../models/user.model';
import { SearchFilterService } from '../../services/search-filter.service';

interface Operation {
  id?: number;
  nomOp: string;
  description: string;
  user?: User;
}

@Component({
  selector: 'app-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css']
})
export class OperationComponent implements OnInit {
  operationForm: FormGroup;
  operations: Operation[] = [];
  filteredOperations: Operation[] = [];
  currentUser: User | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchFields: string[] = [];
  activeFilters: { [field: string]: any } = {};
  
  private apiUrl = 'http://localhost:8085/api/operations';
  private currentUserApiUrl = 'http://localhost:8085/api/user/me';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.operationForm = this.fb.group({
      nomOp: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadCurrentUser();
    this.loadOperations();
  }

  initializeSearchFields() {
    this.searchFields = [
      'id', 'nomOp', 'description', 'user.username', 'user.prenom'
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
    this.loading = true;
    this.error = '';
    
    this.http.get<Operation[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.operations = data;
          this.filteredOperations = [...data];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des opérations';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  onSubmit() {
    if (this.operationForm.valid) {
      if (!this.currentUser) {
        this.error = 'Erreur: utilisateur connecté non trouvé';
        return;
      }
      
      const operationData: any = {
        nomOp: this.operationForm.get('nomOp')?.value,
        description: this.operationForm.get('description')?.value
      };
      
      // Ajouter l'utilisateur seulement lors de la création
      if (!this.isEditing) {
        operationData.user = { matricule: this.currentUser.matricule };
      }
      
      if (this.isEditing && this.editingId) {
        this.updateOperation(this.editingId, operationData);
      } else {
        this.createOperation(operationData);
      }
    }
  }

  createOperation(operation: any) {
    this.http.post<Operation>(this.apiUrl, operation, { headers: this.getHeaders() })
      .subscribe({
        next: (newOperation) => {
          // Assigner les détails de l'utilisateur actuel à la nouvelle opération
          if (this.currentUser && newOperation) {
            newOperation.user = this.currentUser;
          }
          this.operations.push(newOperation);
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Opération créée avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de l\'opération';
          console.error('Erreur:', err);
        }
      });
  }

  updateOperation(id: number, operation: any) {
    this.http.put<Operation>(`${this.apiUrl}/${id}`, operation, { headers: this.getHeaders() })
      .subscribe({
        next: (updatedOperation) => {
          const index = this.operations.findIndex(o => o.id === id);
          if (index !== -1) {
            // Préserver l'utilisateur créateur original
            const originalUser = this.operations[index].user;
            if (updatedOperation && originalUser) {
              updatedOperation.user = originalUser;
            }
            this.operations[index] = updatedOperation;
          }
          this.applyCurrentFilters();
          this.closeModal();
          console.log('Opération mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'opération';
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

  editOperation(operation: Operation) {
    this.isEditing = true;
    this.editingId = operation.id || null;
    this.showModal = true;
    this.operationForm.patchValue({
      nomOp: operation.nomOp,
      description: operation.description
    });
  }

  deleteOperation(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            this.operations = this.operations.filter(o => o.id !== id);
            this.applyCurrentFilters();
            console.log('Opération supprimée avec succès');
          },
          error: (err) => {
            this.error = 'Erreur lors de la suppression de l\'opération';
            console.error('Erreur:', err);
          }
        });
    }
  }

  resetForm() {
    this.operationForm.reset();
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
  }

  onSearchChange(searchValue: string) {
    this.filteredOperations = this.searchFilterService.globalSearch(
      this.operations,
      searchValue,
      this.searchFields
    );
  }

  onClearSearch() {
    this.filteredOperations = [...this.operations];
  }

  private applyCurrentFilters() {
    this.filteredOperations = this.searchFilterService.applyMultipleFilters(
      this.operations, 
      this.activeFilters
    );
  }
}
