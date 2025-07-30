import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  loading = true;
  allUsers: User[] = [];
  activeUsers: User[] = [];
  pendingUsers: User[] = [];
  showUserManagement = false;
  private routeSubscription: Subscription | undefined;
  Role = Role; // Rendre l'énumération accessible dans le template

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.routeSubscription = this.route.url.subscribe(url => {
      this.showUserManagement = url[0]?.path === 'users';
      if (this.showUserManagement && this.currentUser?.role === this.Role.ADMIN) {
        this.loadAllUsers();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.loading = false;
    });
  }

  loadAllUsers(): void {
    if (!this.showUserManagement || this.currentUser?.role !== this.Role.ADMIN) return;
    this.loading = true;
    this.http.get<{ success: boolean; users: User[] }>('http://localhost:8085/api/admin/users?page=0&size=100')
      .subscribe({
        next: (response) => {
          if (response.success && response.users) {
            this.allUsers = response.users;
            this.updateUserGroups();
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading users:', err);
          this.loading = false;
        }
      });
  }

  updateUserGroups(): void {
    this.activeUsers = this.allUsers.filter(user => user.role === this.Role.ADMIN || user.role === this.Role.PARAMETREUR);
    this.pendingUsers = this.allUsers.filter(user => user.role === this.Role.DEFAULT);
  }

  getRoleDisplayName(role: Role): string {
    switch (role) {
      case this.Role.ADMIN:
        return 'Administrateur';
      case this.Role.PARAMETREUR:
        return 'Paramètreur';
      case this.Role.DEFAULT:
        return 'Utilisateur';
      default:
        return 'Utilisateur';
    }
  }

  getRoleDescription(role: Role): string {
    switch (role) {
      case this.Role.ADMIN:
        return 'Vous avez accès à toutes les fonctionnalités d\'administration.';
      case this.Role.PARAMETREUR:
        return 'Vous pouvez gérer les entités et paramètres du système.';
      case this.Role.DEFAULT:
        return 'Vous avez accès aux fonctionnalités de base.';
      default:
        return 'Accès limité en attente d\'activation.';
    }
  }

  getAvailableFeatures(role: Role): string[] {
    switch (role) {
      case this.Role.ADMIN:
        return [
          'Gestion des utilisateurs',
          'user2'
        ];
      case this.Role.PARAMETREUR:
        return [
          'Gestion des entités système',
          'Configuration des paramètres',
          'Consultation des données',
          'Modification du profil personnel'
        ];
      case this.Role.DEFAULT:
        return [
          'Modifier votre compte',
        ];
      default:
        return ['Accès limité'];
    }
  }

  updateUserRole(userId: number, newRole: Role): void {
    if (!this.showUserManagement || this.currentUser?.role !== this.Role.ADMIN) return;
    this.loading = true;
    this.http.put<{ success: boolean; user: User }>(`http://localhost:8085/api/admin/users/${userId}/role?newRole=${newRole}`, {})
      .subscribe({
        next: (response: { success: boolean; user: User }) => {
          if (response.success && response.user) {
            const updatedUser = response.user;
            this.allUsers = this.allUsers.map(user => user.matricule === updatedUser.matricule ? updatedUser : user);
            this.updateUserGroups();
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error updating role:', err);
          this.loading = false;
        }
      });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === this.Role.ADMIN || false;
  }
}