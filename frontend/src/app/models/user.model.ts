export interface User {
  matricule: number;
  username: string;
  prenom: string;
  adresseMail: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export enum Role {
  DEFAULT = 'DEFAULT',
  PARAMETREUR = 'PARAMETREUR',
  ADMIN = 'ADMIN'
}

export interface LoginRequest {
  username: string;
  motDePasse: string;
}

export interface RegisterRequest {
  username: string;
  prenom: string;
  adresseMail: string;
  motDePasse: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  type: string;
  user: User;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: User;
  users?: User[];
  timestamp: number;
}

export interface UserSelfUpdateDTO {
  prenom: string;
  adresseMail: string;
  motDePasse?: string;
}


