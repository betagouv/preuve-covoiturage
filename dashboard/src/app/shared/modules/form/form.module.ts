import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';

import { GraphicModule } from '~/shared/graphic/graphic.module';

import { AddressFormComponent } from './components/address/component';
import { BankFormComponent } from './components/bank/component';
import { CompanyFormComponent } from './components/company/component';

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
    ButtonModule,
  ],
  declarations: [
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
  ],
})
export class FormModule { }
