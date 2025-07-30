// app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, LoginResponse, Role, UserSelfUpdateDTO, ApiResponse } from '../models/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/api'; // Ensure this matches your backend port
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable(); // Public observable for components to subscribe

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadCurrentUser();
    }
  }

  /**
   * Handles user login.
   * @param credentials LoginRequest object containing username and password.
   * @returns An Observable of LoginResponse.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/public/login`, credentials)
      .pipe(
        map(response => {
          console.log('AuthService - Réponse login:', response);
          
          if (response.success && response.token && response.user) {
            console.log('AuthService - Stockage du token et utilisateur');
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            
            // Vérification immédiate
            console.log('AuthService - Token stocké:', localStorage.getItem('token'));
            console.log('AuthService - User stocké:', localStorage.getItem('user'));
          }
          return response;
        })
      );
  }

  /**
   * Handles user registration.
   * @param userData RegisterRequest object containing user details.
   * @returns An Observable of ApiResponse.
   */
  register(userData: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/public/register`, userData);
  }

  /**
   * Logs out the current user by clearing local storage and navigating to login.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null); // Clear the BehaviorSubject
    this.router.navigate(['/login']);
  }

  /**
   * Retrieves the JWT token from local storage.
   * @returns The JWT token or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Retrieves the current user object from local storage.
   * @returns The User object or null if not found.
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        return null;
      }
    }
    return null;
  }

  getAllUsers(): Observable<{ success: boolean; users: User[] }> {
  return this.http.get<{ success: boolean; users: User[] }>(
    `${this.apiUrl}/admin/users?page=0&size=100`
  );
}

updateUserRole(userId: number, newRole: Role): Observable<{ success: boolean; user: User }> {
  return this.http.put<{ success: boolean; user: User }>(
    `${this.apiUrl}/admin/users/${userId}/role?newRole=${newRole}`, {}
  );
}

activateUser(userId: number, role: Role): Observable<{ success: boolean; user: User }> {
  return this.http.post<{ success: boolean; user: User }>(
    `${this.apiUrl}/admin/users/${userId}/activate?activationRole=${role}`, {}
  );
}



  /**
   * Checks if the user is currently logged in and their token is valid.
   * @returns True if logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Checks if the current user has any of the specified roles.
   * @param roles An array of roles to check against.
   * @returns True if the user has any of the roles, false otherwise.
   */
  hasRole(roles: Role[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Convenience method to check if the current user is an ADMIN.
   * @returns True if the user is an ADMIN, false otherwise.
   */
  isAdmin(): boolean {
    return this.hasRole([Role.ADMIN]);
  }

  /**
   * Convenience method to check if the current user is a PARAMETREUR or ADMIN.
   * @returns True if the user is a PARAMETREUR or ADMIN, false otherwise.
   */
  isParametreur(): boolean {
    return this.hasRole([Role.PARAMETREUR, Role.ADMIN]);
  }

  /**
   * Checks if a given JWT token is expired.
   * @param token The JWT token string.
   * @returns True if the token is expired, false otherwise.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // Assume expired or invalid if parsing fails
    }
  }

  /**
   * Loads the current user into the BehaviorSubject from local storage.
   */
  private loadCurrentUser(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Public method to update the current user in the BehaviorSubject.
   * This should be called by components that modify user data.
   * @param user The updated User object.
   */
  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user)); // Also update local storage
  }

  /**
   * Fetches the current authenticated user's profile from the backend.
   * @returns An Observable of the API response containing the user profile.
   */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/user/me`);
  }

  /**
   * Updates the current authenticated user's profile on the backend.
   * @param userData UserSelfUpdateDTO object containing the fields to update.
   * @returns An Observable of the API response after updating the profile.
   */
  updateProfile(userData: UserSelfUpdateDTO): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/user/me`, userData);
  }
}