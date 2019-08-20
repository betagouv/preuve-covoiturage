import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';

import { CampaignAutoCompleteComponent } from './components/campaign-auto-complete/campaign-auto-complete.component';

@NgModule({
  declarations: [CampaignAutoCompleteComponent],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  exports: [CampaignAutoCompleteComponent],
})
export class CampaignUiModule {}
