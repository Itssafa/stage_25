import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User, Role } from '../../../models/user.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === Role.ADMIN;
  }

  isParametreur(): boolean {
    return this.currentUser?.role === Role.PARAMETREUR || this.currentUser?.role === Role.ADMIN;
  }

  navigateToProfile(): void {
    if (this.currentUser?.role === Role.ADMIN) {
      this.router.navigate(['/admin']);
    } else if (this.currentUser?.role === Role.PARAMETREUR) {
      this.router.navigate(['/parametreur/profile']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}