import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SearchFilterService } from '../../services/search-filter.service';

interface User {
  matricule?: number;
  username: string;
  prenom: string;
  adresseMail: string;
  role: string;
  isActive: boolean;
  activationDate?: string;
  activationDurationDays?: number;
  deactivationDate?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  defaultUsers: User[] = [];
  activeUsers: User[] = [];
  filteredDefaultUsers: User[] = [];
  filteredActiveUsers: User[] = [];
  loading = false;
  error = '';

  // Search configuration
  defaultUsersSearchFields: string[] = [];
  activeUsersSearchFields: string[] = [];
  
  // Forms
  editForm: FormGroup;
  activationForm: FormGroup;
  isEditing = false;
  editingUser: User | null = null;
  showActivationModal = false;
  userToActivate: User | null = null;
  
  private apiUrl = 'http://localhost:8085/api/admin/user-management';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private searchFilterService: SearchFilterService
  ) {
    this.editForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      adresseMail: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });

    this.activationForm = this.fb.group({
      durationDays: ['', [Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.initializeSearchFields();
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    // Charger tous les utilisateurs
    this.http.get<User[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() })
      .subscribe({
        next: (allUsers) => {
          // Liste des utilisateurs en attente d'activation : rôle DEFAULT
          this.defaultUsers = allUsers.filter(user => user.role === 'DEFAULT');
          // Liste des utilisateurs actifs : rôles ADMIN ou PARAMETREUR
          this.activeUsers = allUsers.filter(user => user.role === 'ADMIN' || user.role === 'PARAMETREUR');
          
          this.filteredDefaultUsers = [...this.defaultUsers];
          this.filteredActiveUsers = [...this.activeUsers];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des utilisateurs';
          this.loading = false;
          console.error('Erreur:', err);
        }
      });
  }

  editUser(user: User) {
    this.isEditing = true;
    this.editingUser = user;
    this.editForm.patchValue({
      username: user.username,
      prenom: user.prenom,
      adresseMail: user.adresseMail,
      role: user.role
    });
  }

  saveUser() {
    if (this.editForm.valid && this.editingUser) {
      const userData = {
        username: this.editForm.get('username')?.value,
        prenom: this.editForm.get('prenom')?.value,
        adresseMail: this.editForm.get('adresseMail')?.value
      };

      const newRole = this.editForm.get('role')?.value;
      const oldRole = this.editingUser.role;

      // Si le rôle a changé, utiliser l'endpoint spécialisé
      if (newRole !== oldRole) {
        const updateData = {
          user: userData,
          role: newRole
        };

        this.http.put<User>(`${this.apiUrl}/${this.editingUser.matricule}/role`, updateData, { headers: this.getHeaders() })
          .subscribe({
            next: (updatedUser) => {
              this.handleUserUpdate(updatedUser, oldRole);
            },
            error: (err) => {
              this.error = 'Erreur lors de la mise à jour du rôle de l\'utilisateur';
              console.error('Erreur:', err);
            }
          });
      } else {
        // Pas de changement de rôle, mise à jour normale
        this.http.put<User>(`${this.apiUrl}/${this.editingUser.matricule}`, userData, { headers: this.getHeaders() })
          .subscribe({
            next: (updatedUser) => {
              this.handleUserUpdate(updatedUser, oldRole);
            },
            error: (err) => {
              this.error = 'Erreur lors de la mise à jour de l\'utilisateur';
              console.error('Erreur:', err);
            }
          });
      }
    }
  }

  private handleUserUpdate(updatedUser: User, oldRole: string) {
    // Supprimer de l'ancienne liste
    if (oldRole === 'DEFAULT') {
      this.defaultUsers = this.defaultUsers.filter(u => u.matricule !== updatedUser.matricule);
      this.applyFilters('default');
    } else {
      this.activeUsers = this.activeUsers.filter(u => u.matricule !== updatedUser.matricule);
      this.applyFilters('active');
    }

    // Ajouter à la nouvelle liste selon le nouveau rôle/statut
    if (updatedUser.role === 'DEFAULT') {
      this.defaultUsers.push(updatedUser);
      this.applyFilters('default');
    } else {
      this.activeUsers.push(updatedUser);
      this.applyFilters('active');
    }

    this.cancelEdit();
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingUser = null;
    this.editForm.reset();
    this.error = '';
  }

  openActivationModal(user: User) {
    this.userToActivate = user;
    this.showActivationModal = true;
    this.activationForm.reset();
  }

  closeActivationModal() {
    this.showActivationModal = false;
    this.userToActivate = null;
    this.activationForm.reset();
  }

  activateUser() {
    if (this.userToActivate) {
      const durationDays = this.activationForm.get('durationDays')?.value || null;
      const activationData = { durationDays };

      this.http.post<User>(`${this.apiUrl}/${this.userToActivate.matricule}/activate`, activationData, { headers: this.getHeaders() })
        .subscribe({
          next: (activatedUser) => {
            // Retirer de la liste DEFAULT
            this.defaultUsers = this.defaultUsers.filter(u => u.matricule !== activatedUser.matricule);
            // Ajouter à la liste active
            this.activeUsers.push(activatedUser);
            this.applyFilters('default');
            this.applyFilters('active');
            this.closeActivationModal();
          },
          error: (err) => {
            this.error = 'Erreur lors de l\'activation de l\'utilisateur';
            console.error('Erreur:', err);
          }
        });
    }
  }

  deactivateUser(user: User) {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      this.http.post<User>(`${this.apiUrl}/${user.matricule}/deactivate`, {}, { headers: this.getHeaders() })
        .subscribe({
          next: (deactivatedUser) => {
            // Retirer de la liste active
            this.activeUsers = this.activeUsers.filter(u => u.matricule !== deactivatedUser.matricule);
            // Ajouter à la liste DEFAULT
            this.defaultUsers.push(deactivatedUser);
            this.applyFilters('active');
            this.applyFilters('default');
          },
          error: (err) => {
            this.error = 'Erreur lors de la désactivation de l\'utilisateur';
            console.error('Erreur:', err);
          }
        });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getDurationText(durationDays: number | null): string {
    if (!durationDays) return 'Indéterminée';
    return `${durationDays} jour(s)`;
  }

  private initializeSearchFields() {
    // Define search fields for global search
    this.defaultUsersSearchFields = ['matricule', 'username', 'prenom', 'adresseMail', 'role'];
    this.activeUsersSearchFields = ['matricule', 'username', 'prenom', 'adresseMail', 'role'];
  }

  onDefaultUsersSearchChange(searchValue: string) {
    this.filteredDefaultUsers = this.searchFilterService.globalSearch(
      this.defaultUsers,
      searchValue,
      this.defaultUsersSearchFields
    );
  }

  onActiveUsersSearchChange(searchValue: string) {
    this.filteredActiveUsers = this.searchFilterService.globalSearch(
      this.activeUsers,
      searchValue,
      this.activeUsersSearchFields
    );
  }

  onClearDefaultFilters() {
    this.filteredDefaultUsers = [...this.defaultUsers];
  }

  onClearActiveFilters() {
    this.filteredActiveUsers = [...this.activeUsers];
  }

  private applyFilters(type: 'default' | 'active') {
    // Re-apply current search if any
    if (type === 'default') {
      this.filteredDefaultUsers = [...this.defaultUsers];
    } else {
      this.filteredActiveUsers = [...this.activeUsers];
    }
  }
}