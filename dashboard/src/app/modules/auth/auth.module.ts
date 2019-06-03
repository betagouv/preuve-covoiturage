import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { AutofocusDirective } from '~/shared/directives/autofocus.directive';

import { AuthHeaderComponent } from './layout/components/header/component';
import { AuthPageSigninComponent } from './pages/signin/signin.page';
import { AuthLayoutMainComponent } from './layout/main/component';
import { AuthRoutingModule } from './auth.routing';
import { AuthFormSigninComponent } from './components/form/signin/signin.component';
import { AuthPageNewPasswordComponent } from './pages/new-password/new-password.page';
import { AuthFormNewPasswordComponent } from './components/form/new-password/new-password.component';
import { AuthFormForgottenPasswordComponent } from './components/form/forgotten-password/forgotten-password.component';
import { AuthPageForgottenPasswordComponent } from './pages/forgotten-password/forgotten-password.page';
import { AuthPageConfirmEmailComponent } from './pages/confirm-email/confirm-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    AuthRoutingModule,
    ToastModule,
    MessageModule,
    MessagesModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    PasswordModule,
    CardModule,
  ],
  declarations: [
    AuthHeaderComponent,
    AuthLayoutMainComponent,
    AuthFormSigninComponent,
    AuthFormNewPasswordComponent,
    AuthFormForgottenPasswordComponent,
    AuthPageNewPasswordComponent,
    AuthPageForgottenPasswordComponent,
    AuthPageSigninComponent,
    AuthPageConfirmEmailComponent,
    AutofocusDirective,
  ],
  exports: [AuthRoutingModule],
})
export class AuthModule {}
