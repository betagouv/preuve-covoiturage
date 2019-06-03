import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthPageForgottenPasswordComponent } from './pages/forgotten-password/forgotten-password.page';
import { AuthPageConfirmEmailComponent } from './pages/confirm-email/confirm-email.page';

import { AuthPageNewPasswordComponent } from './pages/new-password/new-password.page';
import { AuthPageSigninComponent } from './pages/signin/signin.page';
import { AuthLayoutMainComponent } from './layout/main/component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutMainComponent,
    children: [
      { path: 'signin', component: AuthPageSigninComponent },
      { path: 'reset-password/:reset/:token', component: AuthPageNewPasswordComponent },
      { path: 'forgotten-password', component: AuthPageForgottenPasswordComponent },
      { path: 'confirm-email/:reset/:token', component: AuthPageConfirmEmailComponent },
      { path: 'new-password/:reset/:token', component: AuthPageNewPasswordComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
