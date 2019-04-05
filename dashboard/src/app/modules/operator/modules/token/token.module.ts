/* Angular imports */
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


/* External modules */
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

/* Shared modules */
import { GraphicModule } from '~/shared/graphic/graphic.module';

/* Local components */
import { OperatorCopyComponent } from './components/copy/component';
import { OperatorTokenCreationDialogComponent } from './components/creation/component';
import { OperatorNewTokenDialogComponent } from './components/token/component';


/* Local services */
import { OperatorTokenService } from '../../services/operatorTokenService';


@NgModule({
  imports: [
    CommonModule,
    GraphicModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    InputTextModule,
  ],
  providers: [
    OperatorTokenService,
  ],
  declarations: [
    OperatorCopyComponent,
    OperatorNewTokenDialogComponent,
    OperatorTokenCreationDialogComponent,
  ],
  entryComponents: [
    OperatorNewTokenDialogComponent,
    OperatorTokenCreationDialogComponent,
  ],
  exports: [
    OperatorCopyComponent,
    OperatorNewTokenDialogComponent,
    OperatorTokenCreationDialogComponent,
  ],
})
export class OperatorTokenModule { }
