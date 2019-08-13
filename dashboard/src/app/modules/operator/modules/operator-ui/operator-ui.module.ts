import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/material/material.module';

import { OperatorsAutocompleteComponent } from './components/operators-autocomplete/operators-autocomplete.component';

@NgModule({
  declarations: [OperatorsAutocompleteComponent],
  exports: [OperatorsAutocompleteComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class OperatorUiModule {}
