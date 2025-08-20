import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Operation {
  id?: number;
  nomOp: string;
  description: string;
}

@Component({
  selector: 'app-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.css']
})
export class OperationComponent implements OnInit {
  operationForm: FormGroup;
  operations: Operation[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingId: number | null = null;
  
  private apiUrl = 'http://localhost:8085/api/operations';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.operationForm = this.fb.group({
      nomOp: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
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
    this.loading = true;
    this.error = '';
    
    this.http.get<Operation[]>(this.apiUrl, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.operations = data;
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
      const operationData = {
        nomOp: this.operationForm.get('nomOp')?.value,
        description: this.operationForm.get('description')?.value
      };
      
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
          this.operations.push(newOperation);
          this.resetForm();
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
            this.operations[index] = updatedOperation;
          }
          this.resetForm();
          console.log('Opération mise à jour avec succès');
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de l\'opération';
          console.error('Erreur:', err);
        }
      });
  }

  editOperation(operation: Operation) {
    this.isEditing = true;
    this.editingId = operation.id || null;
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
}
