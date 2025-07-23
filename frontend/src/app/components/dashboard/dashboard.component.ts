import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.loading = false;
    });
  }

  getRoleDisplayName(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Administrateur';
      case Role.PARAMETREUR:
        return 'Paramètreur';
      case Role.DEFAULT:
        return 'Utilisateur';
      default:
        return 'Utilisateur';
    }
  }

  getRoleDescription(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Vous avez accès à toutes les fonctionnalités d\'administration.';
      case Role.PARAMETREUR:
        return 'Vous pouvez gérer les entités et paramètres du système.';
      case Role.DEFAULT:
        return 'Vous avez accès aux fonctionnalités de base.';
      default:
        return 'Accès limité en attente d\'activation.';
    }
  }

  getAvailableFeatures(role: Role): string[] {
    switch (role) {
      case Role.ADMIN:
        return [
          'Gestion complète des utilisateurs',
          'Administration système',
          'Gestion des rôles et permissions',
          'Accès aux statistiques avancées'
        ];
      case Role.PARAMETREUR:
        return [
          'Gestion des entités système',
          'Configuration des paramètres',
          'Consultation des données',
          'Modification du profil personnel'
        ];
      case Role.DEFAULT:
        return [
          'Consultation du profil personnel',
          'Modification des informations de base',
          'Accès aux fonctionnalités publiques'
        ];
      default:
        return ['Accès limité'];
    }
  }
}