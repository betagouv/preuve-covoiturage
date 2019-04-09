/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


/* External modules */
import { MessageModule } from 'primeng/message';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';

/* Other services */

/* Local components */
import { ProfileEditionDialogComponent } from './components/edition/component';
import { ProfileFormComponent } from './components/form/component';
import { ProfileViewComponent } from './components/view/component';
import { PasswordResetViewComponent } from './components/password/view/component';
import { PasswordResetDialogComponent } from './components/password/resetDialog/component';


/* Local services */


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    FormModule,
    FormsModule,
    PasswordModule,

  ],
  providers: [

  ],
  declarations: [
    ProfileEditionDialogComponent,
    ProfileFormComponent,
    ProfileViewComponent,
    PasswordResetViewComponent,
    PasswordResetDialogComponent,
  ],
  exports: [
    ProfileViewComponent,
    PasswordResetViewComponent,
  ],
  entryComponents: [
    ProfileEditionDialogComponent,
    PasswordResetDialogComponent,

  ],
})
export class UserProfileModule { }
