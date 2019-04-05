import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPageForgottenPasswordComponent } from '~/modules/auth/pages/forgottenPassword/component';
import { AuthPageConfirmEmailComponent } from '~/modules/auth/pages/confirmEmail/component';

import { AuthPageNewPasswordComponent } from './pages/newPassword/component';
import { AuthPageSigninComponent } from './pages/signin/component';
import { AuthLayoutMainComponent } from './layout/main/component';

const routes: Routes = [
  { path: '', component: AuthLayoutMainComponent, children: [
      { path: '', redirectTo: '/signin', pathMatch: 'full' }, // todo: this should redirect to dashboard when ping is reinstated
      { path: 'signin', component: AuthPageSigninComponent },
      { path: 'reset-password/:reset/:token', component: AuthPageNewPasswordComponent },
      { path: 'forgotten-password', component: AuthPageForgottenPasswordComponent },
      { path: 'confirm-email/:reset/:token', component: AuthPageConfirmEmailComponent },
      { path: 'new-password/:reset/:token', component: AuthPageNewPasswordComponent },
  ]},
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class AuthRoutingModule { }
