/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* External modules */
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ChipsModule } from 'primeng/chips';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/api';
/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { UserUIModule } from '~/modules/user/modules/ui/ui.module';
/* Local components */
import { AomFormComponent } from './components/form/component';
import { AomCreationDialogComponent } from './components/creation/component';
import { AomEditionDialogComponent } from './components/edition/component';
/* Local services */
import { AomService } from '../../services/aomService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DynamicDialogModule,
    FormModule,
    GraphicModule,
    ChipsModule,
    MessageModule,
    TooltipModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    InputMaskModule,
    UserUIModule,
  ],
  providers: [
    AomService,
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
  ],
  declarations: [
    AomCreationDialogComponent,
    AomEditionDialogComponent,
    AomFormComponent,
  ],
  entryComponents: [
    AomCreationDialogComponent,
    AomEditionDialogComponent,
  ],
  exports: [
    AomFormComponent,
  ],
})
export class AomDialogModule {
}
