import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiGuideRoutingModule } from './ui-guide-routing.module';
import { MaterialModule } from '../../shared/material/material.module';
import { UiGuideComponent } from './ui-guide.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [UiGuideComponent],
  imports: [CommonModule, UiGuideRoutingModule, MaterialModule, SharedModule],
})
export class UiGuideModule {
}
