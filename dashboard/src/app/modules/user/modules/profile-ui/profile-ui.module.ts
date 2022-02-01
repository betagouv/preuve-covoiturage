import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProfileEditionComponent } from './components/profile-edition/profile-edition.component';
import { MaterialModule } from '../../../../shared/modules/material/material.module';

@NgModule({
  declarations: [ProfileEditionComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  exports: [ProfileEditionComponent],
})
export class ProfileUiModule {}
