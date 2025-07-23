// app/components/auth/register/register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiResponse } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required]],
      adresseMail: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$')
      ]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      console.log('Tentative d\'inscription avec:', this.registerForm.value);
      
      this.authService.register(this.registerForm.value).subscribe({
        next: (response: ApiResponse) => {
          console.log('Réponse d\'inscription:', response);
          
          if (response.success) {
            this.successMessage = response.message;
            console.log('Inscription réussie:', this.successMessage);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la création du compte.';
            console.error('Échec d\'inscription:', this.errorMessage);
          }
        },
        error: (error: any) => {
          console.error('Erreur d\'inscription:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      console.log('Formulaire invalide:', this.registerForm.errors);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}