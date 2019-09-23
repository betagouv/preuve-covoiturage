import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InviteEmailComponent } from '~/modules/authentication/pages/invite-email/invite-email.component';

import { ChangeAuthLayoutComponent } from './layouts/change-auth-layout/change-auth-layout.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
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
      // change password
      {
        path: 'reset-password',
        component: NewPasswordComponent,
      },

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
        component: NewPasswordComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
