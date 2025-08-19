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
  Role = Role;
  
  // Statistiques pour le dashboard
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    parametreurUsers: 0,
    defaultUsers: 0,
    totalOrdresFab: 0,
    ordresEnCours: 0,
    ordresTermines: 0,
    totalProduits: 0,
    totalPostes: 0,
    totalOperations: 0,
    totalParametres: 0,
    totalAffectations: 0
  }; // Rendre l'énumération accessible dans le template

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
      if (user) {
        this.loadDashboardStats();
      }
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
          'Gestion complète des utilisateurs',
          'Administration des ordres de fabrication',
          'Supervision de la production',
          'Configuration système avancée',
          'Rapports et statistiques',
          'Gestion des rôles et permissions'
        ];
      case this.Role.PARAMETREUR:
        return [
          'Gestion des ordres de fabrication',
          'Configuration des paramètres',
          'Gestion des postes et opérations',
          'Affectation des ressources',
          'Suivi de la production',
          'Consultation des statistiques'
        ];
      case this.Role.DEFAULT:
        return [
          'Consultation du profil personnel',
          'Modification des informations de base',
          'Accès en lecture seule'
        ];
      default:
        return ['Accès limité en attente d\'activation'];
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

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  loadDashboardStats(): void {
    if (!this.currentUser) {
      console.log('Current user not loaded yet');
      return;
    }
    
    const headers = this.getHeaders();
    
    // Charger les statistiques selon le rôle
    if (this.currentUser.role === this.Role.ADMIN) {
      console.log('Loading admin stats');
      this.loadAdminStats(headers);
    } else if (this.currentUser.role === this.Role.PARAMETREUR) {
      console.log('Loading parametreur stats');
      this.loadParametreurStats(headers);
    } else {
      console.log('Loading default user stats');
      this.loadDefaultUserStats(headers);
    }
  }

  private loadAdminStats(headers: any): void {
    // Statistiques utilisateurs
    this.http.get<any[]>('http://localhost:8085/api/admin/user-management/all', { headers })
      .subscribe({
        next: (users) => {
          console.log('Users loaded:', users); // Debug log
          this.stats.totalUsers = users.length;
          this.stats.adminUsers = users.filter(u => u.role === 'ADMIN').length;
          this.stats.parametreurUsers = users.filter(u => u.role === 'PARAMETREUR' && u.isActive).length;
          this.stats.defaultUsers = users.filter(u => u.role === 'DEFAULT').length;
          this.stats.activeUsers = this.stats.adminUsers + this.stats.parametreurUsers;
        },
        error: (err) => console.error('Erreur chargement stats utilisateurs:', err)
      });

    // Statistiques ordres de fabrication
    this.http.get<any[]>('http://localhost:8085/api/ordrefabs', { headers })
      .subscribe({
        next: (ordres) => {
          this.stats.totalOrdresFab = ordres.length;
          this.stats.ordresEnCours = ordres.filter(o => o.statuts === 'EN_COURS').length;
          this.stats.ordresTermines = ordres.filter(o => o.statuts === 'TERMINE').length;
        },
        error: (err) => console.error('Erreur chargement stats ordres:', err)
      });

    // Autres statistiques
    this.loadCommonStats(headers);
  }

  private loadParametreurStats(headers: any): void {
    // Statistiques ordres de fabrication (lecture seule)
    this.http.get<any[]>('http://localhost:8085/api/ordrefabs', { headers })
      .subscribe({
        next: (ordres) => {
          this.stats.totalOrdresFab = ordres.length;
          this.stats.ordresEnCours = ordres.filter(o => o.statuts === 'EN_COURS').length;
          this.stats.ordresTermines = ordres.filter(o => o.statuts === 'TERMINE').length;
        },
        error: (err) => console.error('Erreur chargement stats ordres:', err)
      });

    this.loadCommonStats(headers);
  }

  private loadDefaultUserStats(headers: any): void {
    // Statistiques limitées pour utilisateur DEFAULT
    this.stats.totalUsers = 0;
    this.stats.activeUsers = 0;
  }

  private loadCommonStats(headers: any): void {
    // Produits
    this.http.get<any[]>('http://localhost:8085/api/produits', { headers })
      .subscribe({
        next: (produits) => this.stats.totalProduits = produits.length,
        error: (err) => console.error('Erreur chargement stats produits:', err)
      });

    // Postes
    this.http.get<any[]>('http://localhost:8085/api/postes', { headers })
      .subscribe({
        next: (postes) => this.stats.totalPostes = postes.length,
        error: (err) => console.error('Erreur chargement stats postes:', err)
      });

    // Opérations
    this.http.get<any[]>('http://localhost:8085/api/operations', { headers })
      .subscribe({
        next: (operations) => this.stats.totalOperations = operations.length,
        error: (err) => console.error('Erreur chargement stats opérations:', err)
      });

    // Paramètres
    this.http.get<any[]>('http://localhost:8085/api/parametres', { headers })
      .subscribe({
        next: (parametres) => this.stats.totalParametres = parametres.length,
        error: (err) => console.error('Erreur chargement stats paramètres:', err)
      });

    // Affectations
    this.http.get<any[]>('http://localhost:8085/api/affectations', { headers })
      .subscribe({
        next: (affectations) => this.stats.totalAffectations = affectations.length,
        error: (err) => console.error('Erreur chargement stats affectations:', err)
      });
  }
}