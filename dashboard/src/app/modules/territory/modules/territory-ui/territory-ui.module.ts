import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { FormModule } from '~/shared/modules/form/form.module';

import { TerritoryFormComponent } from './components/territory-form/territory-form.component';

@NgModule({
  declarations: [TerritoryFormComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule, FormModule],
  exports: [TerritoryFormComponent],
})
export class TerritoryUiModule {}
