import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { FormModule } from '~/shared/modules/form/form.module';

import { OperatorsAutocompleteComponent } from './components/operators-autocomplete/operators-autocomplete.component';
import { OperatorFormComponent } from './components/operator-form/operator-form.component';

@NgModule({
  declarations: [OperatorsAutocompleteComponent, OperatorFormComponent],
  exports: [OperatorsAutocompleteComponent, OperatorFormComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormModule],
})
export class OperatorUiModule {}
