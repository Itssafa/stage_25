// app/components/auth/register/register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiResponse } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';

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
  hideConfirmPassword = true;
  
  // Variables pour la vérification SMS
  showSmsVerification = false;
  smsVerificationCode = '';
  enteredCode = '';
  phoneVerified = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
      adresseMail: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$')
      ]],
      confirmMotDePasse: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('motDePasse');
    const confirmPassword = control.get('confirmMotDePasse');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && this.phoneVerified) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      // Exclure confirmMotDePasse des données envoyées
      const formData = { ...this.registerForm.value };
      delete formData.confirmMotDePasse;
      
      console.log('Tentative d\'inscription avec:', formData);
      
      this.authService.register(formData).subscribe({
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
      if (!this.phoneVerified) {
        this.errorMessage = 'Veuillez vérifier votre numéro de téléphone avant de continuer.';
      } else {
        console.log('Formulaire invalide:', this.registerForm.errors);
      }
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Méthode appelée quand l'utilisateur quitte le champ téléphone
  onPhoneBlur(): void {
    const phoneControl = this.registerForm.get('telephone');
    if (phoneControl?.valid && phoneControl.value && !this.phoneVerified) {
      this.sendSmsCode(phoneControl.value);
    }
  }

  // Envoyer le code de vérification par SMS
  sendSmsCode(telephone: string): void {
    const headers = { 'Content-Type': 'application/json' };
    this.http.post<any>('http://localhost:8085/api/auth/send-sms-code', { telephone }, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showSmsVerification = true;
            this.successMessage = 'Code de vérification envoyé par SMS!';
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'envoi du SMS';
          }
        },
        error: (error) => {
          console.error('Erreur envoi SMS:', error);
          this.errorMessage = 'Erreur lors de l\'envoi du code SMS. Vérifiez la configuration SMS.';
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
  }

  // Vérifier le code SMS saisi par l'utilisateur
  verifySmsCode(): void {
    const telephone = this.registerForm.get('telephone')?.value;
    const headers = { 'Content-Type': 'application/json' };
    
    this.http.post<any>('http://localhost:8085/api/auth/verify-sms-code', 
      { telephone, code: this.enteredCode }, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.phoneVerified = true;
            this.showSmsVerification = false;
            this.successMessage = 'Téléphone vérifié avec succès!';
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Code de vérification incorrect';
            setTimeout(() => this.errorMessage = '', 3000);
          }
        },
        error: (error) => {
          console.error('Erreur vérification SMS:', error);
          this.errorMessage = 'Erreur lors de la vérification du code SMS';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
  }

  // Fermer le popup de vérification SMS
  closeSmsVerification(): void {
    this.showSmsVerification = false;
    this.enteredCode = '';
  }

  // Renvoyer le code SMS
  resendSmsCode(): void {
    const telephone = this.registerForm.get('telephone')?.value;
    if (telephone) {
      this.sendSmsCode(telephone);
    }
  }
}