/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/* External modules */
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { InputMaskModule } from 'primeng/inputmask';

import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';


/* Shared modules */
import { OperatorUIModule } from '~/modules/operator/modules/ui/ui.module';
import { AomUIModule } from '~/modules/aom/modules/ui/ui.module';
import { FormModule } from '~/shared/form/form.module';
import { GraphicModule } from '~/shared/graphic/graphic.module';


/* Other services */
import { OperatorService } from '~/modules/operator/services/operatorService';
import { AomService } from '~/modules/aom/services/aomService';
import { DropdownService } from '~/services/dropdownService';

/* Local components */
import { UserFormComponent } from './components/form/component';
import { UserCreationDialogComponent } from './components/creation/component';
import { UserEditionDialogComponent } from './components/edition/component';

/* Local services */
import { UserService } from '../../services/userService';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicDialogModule,
    ButtonModule,
    InputTextModule,
    InputSwitchModule,
    DropdownModule,
    MessageModule,
    OperatorUIModule,
    InputMaskModule,
    AomUIModule,
    FormModule,
    GraphicModule,
  ],
  providers: [
    UserService,
    OperatorService,
    AomService,
    DropdownService,
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
  ],
  declarations: [
    UserCreationDialogComponent,
    UserEditionDialogComponent,
    UserFormComponent,
  ],
  entryComponents: [
    UserCreationDialogComponent,
    UserEditionDialogComponent,
  ],
})
export class UserDialogModule { }
