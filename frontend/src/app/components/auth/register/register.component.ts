import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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

  // Variables pour la vérification email
  emailVerified = false;
  emailCodeSent = false;
  enteredCode = '';
  codeError = '';

  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
      adresseMail: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).+$')
      ]],
      confirmMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse')?.value;
    const confirmPassword = form.get('confirmMotDePasse')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onEmailBlur() {
    const email = this.registerForm.get('adresseMail')?.value;
    if (email && this.registerForm.get('adresseMail')?.valid && !this.emailVerified) {
      console.log('Email detecte:', email);
    }
  }

  sendVerificationCode() {
    const email = this.registerForm.get('adresseMail')?.value;

    if (!email || !this.registerForm.get('adresseMail')?.valid) {
      this.errorMessage = "Veuillez entrer une adresse e-mail valide avant d'envoyer le code.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.codeError = '';

    console.log('Envoi du code a:', email);

    this.authService.sendEmailCode(email).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Reponse backend:', res);
        
        if (res.success) {
          this.emailCodeSent = true;
          this.successMessage = 'Code envoye ! Verifiez votre boite mail.';
          
          // Si le backend renvoie le code en mode debug (cast en any pour éviter l'erreur TypeScript)
          if ((res as any).code) {
            console.log('CODE RECU (DEBUG):', (res as any).code);
          }
          
          setTimeout(() => {
            document.getElementById('verificationCode')?.focus();
          }, 300);
        } else {
          this.errorMessage = res.message || 'Erreur lors de l\'envoi du code.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur backend:', err);
        this.errorMessage = err.error?.message || 'Erreur serveur lors de l\'envoi du code.';
      }
    });
  }

  verifyEmailCode() {
    const email = this.registerForm.get('adresseMail')?.value;
    
    if (!email || !this.enteredCode) {
      this.codeError = "Veuillez entrer le code recu par e-mail.";
      return;
    }

    if (this.enteredCode.length !== 6) {
      this.codeError = "Le code doit contenir exactement 6 chiffres.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.codeError = '';

    console.log('Verification du code:', this.enteredCode);

    this.authService.verifyEmailCode(email, this.enteredCode).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Resultat verification:', res);
        
        if (res.success) {
          this.emailVerified = true;
          this.successMessage = 'Email verifie ! Vous pouvez creer votre compte.';
          this.codeError = '';
          console.log('EMAIL VERIFIE !');
        } else {
          this.codeError = res.message || 'Code incorrect ou expire. Reessayez.';
          this.emailVerified = false;
          console.log('Code incorrect');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur verification:', err);
        this.codeError = err.error?.message || 'Code incorrect ou expire.';
        this.emailVerified = false;
      }
    });
  }

  resendVerificationCode() {
    this.emailCodeSent = false;
    this.emailVerified = false;
    this.enteredCode = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.codeError = '';
    
    this.sendVerificationCode();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs correctement.";
      return;
    }

    if (!this.emailVerified) {
      this.errorMessage = "Vous devez verifier votre e-mail avant de creer le compte.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData = {
      username: this.registerForm.value.username,
      prenom: this.registerForm.value.prenom,
      telephone: this.registerForm.value.telephone,
      adresseMail: this.registerForm.value.adresseMail,
      motDePasse: this.registerForm.value.motDePasse
    };

    console.log('Creation du compte:', registerData);

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.loading = false;
        console.log('Reponse creation compte:', res);
        
        if (res.success) {
          this.successMessage = 'Compte cree avec succes ! Redirection...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.errorMessage = res.message || 'Erreur lors de la creation du compte.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur creation compte:', err);
        this.errorMessage = err.error?.message || 'Erreur serveur.';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}