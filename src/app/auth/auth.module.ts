import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordFormComponent } from '../shared/components/password-form/password-form.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SharedModule } from '@app/shared';

@NgModule({
  declarations: [
    LoginComponent,
    ChangePasswordComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class AuthModule { }
