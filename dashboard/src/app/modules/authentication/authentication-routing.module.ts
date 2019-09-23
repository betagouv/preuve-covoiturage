import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InviteEmailComponent } from '~/modules/authentication/pages/invite-email/invite-email.component';
import { ResetPasswordGuardService } from '~/core/guards/reset-password-guard.service';
import { ConfirmEmailComponent } from '~/modules/authentication/pages/confirm-email/confirm-email.component';
import { ResetForgottenPasswordComponent } from '~/modules/authentication/pages/reset-forgotten-password/reset-forgotten-password.component';

import { ChangeAuthLayoutComponent } from './layouts/change-auth-layout/change-auth-layout.component';
import { ForgottenPasswordComponent } from './pages/forgotten-password/forgotten-password.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordGuardService } from '~/core/guards/reset-password-guard.service';
import { ConfirmEmailComponent } from '~/modules/authentication/pages/confirm-email/confirm-email.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: ChangeAuthLayoutComponent,
    children: [
      // Invitation confirm
      {
        path: 'activate/:email/:token',
        canActivate: [ResetPasswordGuardService],
        component: InviteEmailComponent,
      },

      {
        path: 'confirm-email/:email/:token',
        canActivate: [ResetPasswordGuardService],
        component: ConfirmEmailComponent,
      },

      // forgot password
      { path: 'forgotten-password', component: ForgottenPasswordComponent },
      {
        path: 'reset-forgotten-password/:email/:token',
        canActivate: [ResetPasswordGuardService],
        component: ResetForgottenPasswordComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
