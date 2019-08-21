import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { OperatorTokenFormComponent } from './components/operator-token-form/operator-token-form.component';
import { OperatorTokenComponent } from './components/operator-token/operator-token.component';
import { OperatorTokenModalComponent } from './components/operator-token-modal/operator-token-modal.component';

@NgModule({
  declarations: [OperatorTokenComponent, OperatorTokenFormComponent, OperatorTokenModalComponent],
  imports: [CommonModule, MaterialModule, SharedModule, ReactiveFormsModule],
  entryComponents: [OperatorTokenModalComponent],
  exports: [OperatorTokenComponent],
})
export class OperatorTokenUiModule {}
