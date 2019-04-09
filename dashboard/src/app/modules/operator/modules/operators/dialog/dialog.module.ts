/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/* External modules */
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';

/* Local components */
import { OperatorCreationDialogComponent } from './components/creation/component';
import { OperatorFormComponent } from './components/form/component';
import { OperatorEditionDialogComponent } from './components/edition/component';

/* Local services */
import { OperatorService } from '../../../services/operatorService';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DynamicDialogModule,
    InputTextModule,
    FormModule,
    GraphicModule,
  ],
  providers: [
    OperatorService,
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
  ],
  declarations: [
    OperatorCreationDialogComponent,
    OperatorEditionDialogComponent,
    OperatorFormComponent,
  ],
  entryComponents: [
    OperatorCreationDialogComponent,
    OperatorEditionDialogComponent,
  ],
  exports: [
    OperatorFormComponent,
  ],
})
export class OperatorDialogModule { }
