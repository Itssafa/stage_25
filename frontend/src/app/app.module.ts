// app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // <--- IMPORTANT: Make sure this is imported
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import all your components that are used in the application
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component'; 
import { NavigationComponent } from './components/shared/navigation/navigation.component'; // Assuming you have this

// Import your services, guards, interceptors
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SidebarComponent } from './components/shared/navigation/sidebar/sidebar.component';
import { LigneProductionComponent } from './components/ligne-production/ligne-production.component';
import { PosteComponent } from './components/poste/poste.component';
import { ProduitComponent } from './components/produit/produit.component';
import { ApplicationComponent } from './components/application/application.component';
import { OperationComponent } from './components/operation/operation.component';
import { OrdreFabComponent } from './components/ordre-fab/ordre-fab.component';
import { AffectationComponent } from './components/affectation/affectation.component';
import { ParametreComponent } from './components/parametre/parametre.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    ProfileComponent, 
    NavigationComponent, HomepageComponent,
    SidebarComponent,
    LigneProductionComponent,
    PosteComponent,
    ProduitComponent,
    ApplicationComponent,
    OperationComponent,
    OrdreFabComponent,
    AffectationComponent,
    ParametreComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule, // <--- IMPORTANT: Add ReactiveFormsModule here
    HttpClientModule, // <--- IMPORTANT: Add HttpClientModule here
    ReactiveFormsModule 
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
