// app/components/auth/login/login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Role, LoginResponse } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      motDePasse: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      console.log('Tentative de connexion avec:', this.loginForm.value);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: LoginResponse) => {
          console.log('Réponse de connexion:', response);
          
          if (response.success && response.user) {
            console.log('Connexion réussie pour:', response.user.username);
            
            // Attendre un peu que le token soit stocké, puis naviguer
            setTimeout(() => {
              console.log('Navigation vers /dashboard...');
              this.router.navigate(['/dashboard']).then(success => {
                console.log('Navigation réussie:', success);
              }).catch(error => {
                console.error('Erreur de navigation:', error);
              });
            }, 100);
            
          } else {
            this.errorMessage = response.message || 'Erreur de connexion. Veuillez réessayer.';
            console.error('Échec de connexion:', this.errorMessage);
          }
        },
        error: (error: any) => {
          console.error('Erreur de connexion:', error);
          this.errorMessage = error.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      console.log('Formulaire invalide:', this.loginForm.errors);
    }
  }

  testNavigation(): void {
    console.log('Test navigation...');
    console.log('Token:', this.authService.getToken());
    console.log('IsLoggedIn:', this.authService.isLoggedIn());
    
    this.router.navigate(['/dashboard']).then(success => {
      console.log('Navigation test réussie:', success);
    }).catch(error => {
      console.error('Erreur navigation test:', error);
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/dashboard']);
  }
}