import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';

import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { ContactsFormComponent } from '~/shared/modules/form/components/contacts/component';
import { UserUIModule } from '~/modules/user/modules/ui/ui.module';

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
    UserUIModule,

  ],
  declarations: [
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
    ContactsFormComponent,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    AddressFormComponent,
    BankFormComponent,
    CompanyFormComponent,
    ContactsFormComponent,
  ],
})
export class FormModule { }
