import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { InputMaskModule } from 'primeng/inputmask';

import { GraphicModule } from '~/shared/graphic/graphic.module';

import { InputControlService } from './services/inputControlService';

import { AddressFormComponent } from './components/address/component';
import { BankFormComponent } from './components/bank/component';
import { CompanyFormComponent } from './components/company/component';
import { DynamicCreationComponent } from './components/creation/component';
import { DynamicEditionComponent } from './components/edition/component';
import { DynamicInputComponent } from './components/input/component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GraphicModule,
    FieldsetModule,
    InputTextModule,
    InputMaskModule,
    MessageModule,
  ],
  providers: [
    InputControlService,
  ],
  declarations: [
    DynamicCreationComponent,
    DynamicEditionComponent,
    DynamicInputComponent,
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,

    DynamicCreationComponent,
    DynamicEditionComponent,
    DynamicInputComponent,
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
  ],
})
export class FormModule { }
