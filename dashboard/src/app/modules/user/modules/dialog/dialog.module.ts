/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
/* External modules */
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

/* Shared modules */
import { AomUIModule } from '~/modules/aom/modules/ui/ui.module';
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { OperatorUIModule } from '~/modules/operator/modules/operators/ui/ui.module';
/* Other services */
import { OperatorService } from '~/modules/operator/services/operatorService';
import { AomService } from '~/modules/aom/services/aomService';
import { DropdownService } from '~/shared/services/dropdownService';

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
    RadioButtonModule,
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
export class UserDialogModule {
}
