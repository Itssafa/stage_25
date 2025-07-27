

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, UserSelfUpdateDTO, ApiResponse } from '../../models/user.model'; 
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Initialize form with empty values, will be populated on load
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }], // Username is not editable
      prenom: ['', [Validators.required]],
      adresseMail: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [
        Validators.minLength(8),
        // Add pattern validation for password if you want to enforce it on update
        // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$')
      ]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Fetches the current user's profile from the backend and populates the form.
   */
  loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.getProfile().subscribe({
      next: (response: ApiResponse<User>) => { // Explicitly type response
        if (response.success && response.user) {
          this.currentUser = response.user;
          this.profileForm.patchValue({
            username: this.currentUser.username,
            prenom: this.currentUser.prenom,
            adresseMail: this.currentUser.adresseMail
          });
          this.successMessage = response.message;
        } else {
          this.errorMessage = response.message || 'Impossible de charger le profil.';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading profile:', error);
        this.errorMessage = error.error?.message || 'Erreur lors du chargement du profil.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Submits the updated profile data to the backend.
   */
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // Show validation errors
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updatePayload: UserSelfUpdateDTO = {
      prenom: this.profileForm.get('prenom')?.value,
      adresseMail: this.profileForm.get('adresseMail')?.value
    };

    // Only include password in payload if it's provided and not blank
    const newPassword = this.profileForm.get('motDePasse')?.value;
    if (newPassword) {
      updatePayload.motDePasse = newPassword;
    }

    this.authService.updateProfile(updatePayload).subscribe({
      next: (response: ApiResponse<User>) => { // Explicitly type response
        if (response.success && response.user) {
          this.currentUser = response.user; // Update local user data
          this.authService.updateCurrentUser(response.user); // <--- Use the new public method
          
          this.successMessage = response.message;
          this.profileForm.get('motDePasse')?.reset(); // Clear password field after successful update
        } else {
          this.errorMessage = response.message || 'Échec de la mise à jour du profil.';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du profil.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
