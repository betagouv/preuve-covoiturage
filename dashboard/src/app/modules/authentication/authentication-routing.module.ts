import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InviteEmailComponent } from '~/modules/authentication/pages/invite-email/invite-email.component';
import { ConfirmEmailComponent } from '~/modules/authentication/pages/confirm-email/confirm-email.component';

import { ChangeAuthLayoutComponent } from './layouts/change-auth-layout/change-auth-layout.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { ForgottenPasswordComponent } from './pages/forgotten-password/forgotten-password.component';
import { LoginComponent } from './pages/login/login.component';
import { ResetPasswordGuardService } from '~/core/guards/reset-password-guard.service';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: ChangeAuthLayoutComponent,
    children: [
      {
        path: 'reset-password/:email/:token',
        canActivate: [ResetPasswordGuardService],
        component: NewPasswordComponent,
      },
      { path: 'forgotten-password', component: ForgottenPasswordComponent },
      { path: 'invite-email/:confirm/:token', component: InviteEmailComponent },
      { path: 'confirm-email/:confirm/:token', component: ConfirmEmailComponent },
      { path: 'new-password/:reset/:token', component: NewPasswordComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
