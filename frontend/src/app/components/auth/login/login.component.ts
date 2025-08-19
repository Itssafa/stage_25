// app/components/auth/login/login.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  
  // Variables pour la récupération de mot de passe
  showForgotPassword = false;
  showResetForm = false;
  resetPhone = '';
  enteredResetCode = '';
  newPassword = '';
  confirmNewPassword = '';
  hideNewPassword = true;
  hideConfirmNewPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
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
    this.router.navigate(['/register']);
  }

  // Méthodes pour la récupération de mot de passe
  openForgotPassword(): void {
    console.log('openForgotPassword appelée');
    this.showForgotPassword = true;
    this.showResetForm = false;
    this.resetPhone = '';
    this.enteredResetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.errorMessage = '';
    console.log('showForgotPassword:', this.showForgotPassword);
  }

  closeForgotPassword(): void {
    this.showForgotPassword = false;
    this.showResetForm = false;
    this.resetPhone = '';
    this.enteredResetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.errorMessage = '';
  }

  sendResetCode(): void {
    const headers = { 'Content-Type': 'application/json' };
    this.http.post<any>('http://localhost:8085/api/auth/send-reset-code', 
      { telephone: this.resetPhone }, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showResetForm = true;
            this.errorMessage = '';
            console.log('Code de récupération envoyé:', response.code);
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'envoi du code';
          }
        },
        error: (error) => {
          console.error('Erreur envoi code reset:', error);
          this.errorMessage = 'Numéro de téléphone non trouvé ou erreur serveur';
        }
      });
  }

  resendResetCode(): void {
    this.sendResetCode();
  }

  resetPassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    const headers = { 'Content-Type': 'application/json' };
    this.http.post<any>('http://localhost:8085/api/auth/reset-password', {
      telephone: this.resetPhone,
      code: this.enteredResetCode,
      newPassword: this.newPassword
    }, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.closeForgotPassword();
            this.errorMessage = '';
            alert('Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.');
          } else {
            this.errorMessage = response.message || 'Code incorrect ou expiré';
          }
        },
        error: (error) => {
          console.error('Erreur reset password:', error);
          this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe';
        }
      });
  }
}