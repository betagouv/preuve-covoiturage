/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


/* External modules */
import { MessageModule } from 'primeng/message';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

/* Shared modules */

/* Other services */

/* Local components */
import { ProfileEditionDialogComponent } from './components/edition/component';
import { ProfileFormComponent } from './components/form/component';
import { ProfileViewComponent } from './components/view/component';


/* Local services */


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    ButtonModule,
    InputTextModule,
    MessageModule,

  ],
  providers: [

  ],
  declarations: [
    ProfileEditionDialogComponent,
    ProfileFormComponent,
    ProfileViewComponent,
  ],
  exports: [
    ProfileViewComponent,
  ],
  entryComponents: [
    ProfileEditionDialogComponent,
  ],
})
export class UserProfileModule { }
