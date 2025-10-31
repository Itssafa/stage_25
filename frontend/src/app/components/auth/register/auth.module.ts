import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // 👈 Important!
import { RegisterComponent } from 'src/app/components/auth/register/register.component';
@NgModule({
  declarations: [
    RegisterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // Pour le FormGroup
    FormsModule          // Pour [(ngModel)] ✅
  ]
})
export class AuthModule { }