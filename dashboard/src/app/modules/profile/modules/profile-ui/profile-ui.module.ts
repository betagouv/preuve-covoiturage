import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/material/material.module';

import { ProfileEditionComponent } from './components/profile-edition/profile-edition.component';

@NgModule({
  declarations: [ProfileEditionComponent],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  exports: [ProfileEditionComponent],
})
export class ProfileUiModule {}
