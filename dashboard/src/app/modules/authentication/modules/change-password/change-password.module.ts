import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { MaterialModule } from '../../../../shared/modules/material/material.module';

@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  exports: [ChangePasswordComponent],
})
export class ChangePasswordModule {}
