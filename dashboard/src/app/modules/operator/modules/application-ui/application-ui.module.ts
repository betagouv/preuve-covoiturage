import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationComponent } from './components/application/application.component';
import { ApplicationModalComponent } from './components/application-modal/application-modal.component';
import { SharedModule } from '../../../../shared/shared.module';
import { MaterialModule } from '../../../../shared/modules/material/material.module';

@NgModule({
  declarations: [ApplicationComponent, ApplicationFormComponent, ApplicationModalComponent],
  imports: [CommonModule, MaterialModule, SharedModule, ReactiveFormsModule],
  exports: [ApplicationComponent],
})
export class ApplicationUiModule {}
