import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const token = this.authService.getToken();
    
    console.log('AuthGuard - isLoggedIn:', isLoggedIn);
    console.log('AuthGuard - token exists:', !!token);
    
    if (isLoggedIn) {
      console.log('AuthGuard - Accès autorisé');
      return true;
    }
    
    console.log('AuthGuard - Accès refusé, redirection vers login');
    this.router.navigate(['/login']);
    return false;
  }
}