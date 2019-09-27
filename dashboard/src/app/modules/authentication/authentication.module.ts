import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

import { LoginComponent } from './pages/login/login.component';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { ForgottenPasswordComponent } from './pages/forgotten-password/forgotten-password.component';
import { InviteEmailComponent } from './pages/invite-email/invite-email.component';
import { ChangeAuthLayoutComponent } from './layouts/change-auth-layout/change-auth-layout.component';
import { ConfirmEmailComponent } from './pages/confirm-email/confirm-email.component';
import { ResetForgottenPasswordComponent } from './pages/reset-forgotten-password/reset-forgotten-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    ForgottenPasswordComponent,
    InviteEmailComponent,
    ChangeAuthLayoutComponent,
    ConfirmEmailComponent,
    ResetForgottenPasswordComponent,
  ],
  imports: [CommonModule, SharedModule, MaterialModule, FormsModule, ReactiveFormsModule, AuthenticationRoutingModule],
})
export class AuthenticationModule {}
