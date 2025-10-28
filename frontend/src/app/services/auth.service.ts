// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  User,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  Role,
  UserSelfUpdateDTO,
  ApiResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/api'; // Assure-toi que c’est le bon port backend
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadCurrentUser();
    }
  }

  /** 🔐 LOGIN */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/public/login`, credentials).pipe(
      map((response: LoginResponse) => {
        console.log('AuthService - Réponse login:', response);

        if (response.success && response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }

        return response;
      })
    );
  }

  /** 📝 REGISTER */
  register(userData: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/public/register`, userData);
  }

  /** 🚪 LOGOUT */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** 🎫 TOKEN */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** 👤 UTILISATEUR ACTUEL */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Erreur parsing user depuis localStorage", e);
      return null;
    }
  }

  /** 🔁 ADMIN ACTIONS */
  getAllUsers(): Observable<{ success: boolean; users: User[] }> {
    return this.http.get<{ success: boolean; users: User[] }>(
      `${this.apiUrl}/admin/users?page=0&size=100`
    );
  }

  updateUserRole(userId: number, newRole: Role): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(
      `${this.apiUrl}/admin/users/${userId}/role?newRole=${newRole}`,
      {}
    );
  }

  activateUser(userId: number, role: Role): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>(
      `${this.apiUrl}/admin/users/${userId}/activate?activationRole=${role}`,
      {}
    );
  }

  /** ✅ ROLES / TOKEN / SESSION */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole([Role.ADMIN]);
  }

  isParametreur(): boolean {
    return this.hasRole([Role.PARAMETREUR, Role.ADMIN]);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Erreur vérification token expiré:', error);
      return true;
    }
  }

  private loadCurrentUser(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  public updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /** 👤 PROFIL UTILISATEUR */
  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/user/me`);
  }

  updateProfile(userData: UserSelfUpdateDTO): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/user/me`, userData);
  }

  /** 📩 ENVOI DU CODE PAR E-MAIL */
  sendEmailCode(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/send-email-code`,
      { email }
    );
  }

  /** 🔍 VÉRIFICATION DU CODE */
  verifyEmailCode(email: string, code: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/verify-email-code`,
      { email, code }
    );
  }
}
