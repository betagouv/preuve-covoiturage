import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '~/shared/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { UiGuideRoutingModule } from './ui-guide-routing.module';
import { UiGuideComponent } from './ui-guide.component';

@NgModule({
  declarations: [UiGuideComponent],
  imports: [CommonModule, UiGuideRoutingModule, MaterialModule, SharedModule],
})
export class UiGuideModule {}
