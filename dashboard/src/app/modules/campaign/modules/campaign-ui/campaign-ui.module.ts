/* eslint-disable max-len */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartjsModule } from '@ctrl/ngx-chartjs';
import { RouterModule } from '@angular/router';

import { CampaignAutoCompleteComponent } from './components/campaign-auto-complete/campaign-auto-complete.component';
import { CampaignSummaryTextComponent } from './components/campaign-summary-text/campaign-summary-text.component';
import { CampaignMainMetricsComponent } from './components/campaign-main-metrics/campaign-main-metrics.component';
import { CampaignTableComponent } from './components/campaign-table/campaign-table.component';
import { MaterialModule } from '../../../../shared/modules/material/material.module';

@NgModule({
  declarations: [
    CampaignAutoCompleteComponent,
    CampaignSummaryTextComponent,
    CampaignMainMetricsComponent,
    CampaignTableComponent,
  ],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, ChartjsModule, RouterModule],
  exports: [
    CampaignAutoCompleteComponent,
    CampaignSummaryTextComponent,
    CampaignMainMetricsComponent,
    CampaignTableComponent,
  ],
})
export class CampaignUiModule {}
