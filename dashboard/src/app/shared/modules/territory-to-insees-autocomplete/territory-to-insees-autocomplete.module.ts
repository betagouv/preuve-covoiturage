// eslint-disable-next-line max-len
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
// eslint-disable-next-line max-len
import { TerritoriesToInseesAutocompleteComponent } from './components/territories-to-insees-autocomplete/territories-to-insees-autocomplete.component';

@NgModule({
  declarations: [TerritoriesToInseesAutocompleteComponent],
  exports: [TerritoriesToInseesAutocompleteComponent],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
})
export class TerritoryToInseesAutocompleteModule {}
