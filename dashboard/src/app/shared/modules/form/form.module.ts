import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { FormContactComponent } from '~/shared/modules/form/components/form-contact/form-contact.component';

import { FormBankComponent } from './components/form-bank/form-bank.component';
import { FormAddressComponent } from './components/form-address/form-address.component';
import { FormCompanyComponent } from './components/form-company/form-company.component';

@NgModule({
  declarations: [FormBankComponent, FormAddressComponent, FormCompanyComponent, FormContactComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  exports: [FormContactComponent, FormCompanyComponent, FormAddressComponent, FormBankComponent],
})
export class FormModule {}
