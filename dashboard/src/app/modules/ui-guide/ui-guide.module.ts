import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NouisliderModule } from 'ng2-nouislider';

import { FormsModule } from '@angular/forms';

import { UiGuideRoutingModule } from './ui-guide-routing.module';
import { UiGuideComponent } from './ui-guide.component';
import { MaterialModule } from '../../shared/modules/material/material.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [UiGuideComponent],
  imports: [CommonModule, UiGuideRoutingModule, MaterialModule, SharedModule, NouisliderModule, FormsModule],
})
export class UiGuideModule {}
