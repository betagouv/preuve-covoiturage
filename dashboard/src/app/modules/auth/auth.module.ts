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
import { AuthPageSigninComponent } from './pages/signin/component';
import { AuthLayoutMainComponent } from './layout/main/component';
import { AuthRoutingModule } from './auth.routing';
import { AuthFormSigninComponent } from './components/form/signin/component';
import { AuthPageNewPasswordComponent } from './pages/newPassword/component';
import { AuthFormNewPasswordComponent } from './components/form/newPassword/component';
import { AuthFormForgottenPasswordComponent } from './components/form/forgottenPassword/component';
import { AuthPageForgottenPasswordComponent } from './pages/forgottenPassword/component';
import { AuthPageConfirmEmailComponent } from './pages/confirmEmail/component';

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
  exports: [
    AuthRoutingModule,
  ],

})
export class AuthModule {
}
