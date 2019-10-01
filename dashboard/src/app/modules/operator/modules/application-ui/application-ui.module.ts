import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationComponent } from './components/application/application.component';
import { ApplicationModalComponent } from './components/application-modal/application-modal.component';

@NgModule({
  declarations: [ApplicationComponent, ApplicationFormComponent, ApplicationModalComponent],
  imports: [CommonModule, MaterialModule, SharedModule, ReactiveFormsModule],
  entryComponents: [ApplicationModalComponent],
  exports: [ApplicationComponent],
})
export class ApplicationUiModule {}
