import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LigneProductionComponent } from './components/ligne-production/ligne-production.component';
import { PosteComponent } from './components/poste/poste.component';
import { ProduitComponent } from './components/produit/produit.component';
import { ApplicationComponent } from './components/application/application.component';
import { OperationComponent } from './components/operation/operation.component';
import { OrdreFabComponent } from './components/ordre-fab/ordre-fab.component';
import { AffectationComponent } from './components/affectation/affectation.component';
import { ParametreComponent } from './components/parametre/parametre.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },          
  { path: 'homepage', component: HomepageComponent },                 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: 'users', component: DashboardComponent }
    ]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  
  // Routes pour les entités de production
  { path: 'lignes', component: LigneProductionComponent, canActivate: [AuthGuard] },
  { path: 'postes', component: PosteComponent, canActivate: [AuthGuard] },
  { path: 'produits', component: ProduitComponent, canActivate: [AuthGuard] },
  { path: 'applications', component: ApplicationComponent, canActivate: [AuthGuard] },
  { path: 'operations', component: OperationComponent, canActivate: [AuthGuard] },
  { path: 'ordres', component: OrdreFabComponent, canActivate: [AuthGuard] },
  { path: 'affectations', component: AffectationComponent, canActivate: [AuthGuard] },
  { path: 'parametres', component: ParametreComponent, canActivate: [AuthGuard] },
  
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    children: [
      { path: 'users', component: UserManagementComponent }
    ]
  },
  
  { path: '**', redirectTo: '/homepage' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }