import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { AuthService } from '../../services/auth.service.ts'; // 🔹 importe ton AuthService
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

  // 👇 Variables pour la vérification e-mail
  emailVerified = false;
  emailCodeSent = false;
  enteredCode = ''; // le code saisi par l'utilisateur

  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // ✅ injecte le service d’authentification
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

  // ✅ Vérifie si les deux mots de passe correspondent
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('motDePasse')?.value;
    const confirmPassword = form.get('confirmMotDePasse')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // 🔍 Détecte l’e-mail au blur (optionnel, juste pour debug)
  onEmailBlur() {
    const email = this.registerForm.get('adresseMail')?.value;
    if (email && this.registerForm.get('adresseMail')?.valid && !this.emailVerified) {
      console.log(`Email détecté : ${email}`);
    }
  }

  // 📩 Envoi du code de vérification via le backend
  sendVerificationCode() {
    const email = this.registerForm.get('adresseMail')?.value;

    if (!email || !this.registerForm.get('adresseMail')?.valid) {
      this.errorMessage = "Veuillez entrer une adresse e-mail valide avant d’envoyer le code.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.sendEmailCode(email).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.emailCodeSent = true;
          this.successMessage = res.message || `Un code a été envoyé à ${email}`;
          console.log('✅ Code envoyé:', res);
        } else {
          this.errorMessage = res.message || 'Erreur lors de l’envoi du code.';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Erreur backend:', err);
        this.errorMessage = err.error?.message || 'Erreur serveur.';
      }
    });
  }

  // ✅ Vérifie le code saisi en appelant le backend
  verifyEmailCode() {
    const email = this.registerForm.get('adresseMail')?.value;
    if (!email || !this.enteredCode) {
      this.errorMessage = "Veuillez entrer le code reçu par e-mail.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyEmailCode(email, this.enteredCode).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.emailVerified = true;
          this.successMessage = res.message || '✅ Adresse e-mail vérifiée avec succès !';
        } else {
          this.errorMessage = res.message || '❌ Code incorrect ou expiré.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la vérification du code.';
      }
    });
  }

  // 🔁 Renvoyer le code
  resendVerificationCode() {
    this.emailCodeSent = false;
    this.emailVerified = false;
    this.enteredCode = '';
    this.sendVerificationCode(); // renvoie un nouveau code
  }

  // 📝 Soumission du formulaire d'inscription
  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs correctement.";
      return;
    }

    if (!this.emailVerified) {
      this.errorMessage = "Veuillez vérifier votre e-mail avant de créer le compte.";
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // 🔗 Appel réel au backend pour l'inscription
    const registerData = {
      username: this.registerForm.value.username,
      prenom: this.registerForm.value.prenom,
      telephone: this.registerForm.value.telephone,
      adresseMail: this.registerForm.value.adresseMail,
      motDePasse: this.registerForm.value.motDePasse
    };

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = '🎉 Compte créé avec succès !';
          console.log('✅ Utilisateur enregistré:', registerData);
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = res.message || 'Erreur lors de la création du compte.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur serveur.';
      }
    });
  }

  // 🔙 Aller vers la page de connexion
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
