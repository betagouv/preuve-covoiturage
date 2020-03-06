import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartjsModule } from '@ctrl/ngx-chartjs';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '~/shared/modules/material/material.module';

import { CampaignAutoCompleteComponent } from './components/campaign-auto-complete/campaign-auto-complete.component';
import { CampaignContactsComponent } from './components/campaign-contacts/campaign-contacts.component';
// eslint-disable-next-line
import { CampaignRetributionViewComponent } from './components/campaign-retribution-view/campaign-retribution-view.component';
// eslint-disable-next-line
import { CampaignMainStatsViewComponent } from './components/campaign-main-stats-view/campaign-main-stats-view.component';
// eslint-disable-next-line
import { CampaignSummaryTextComponent } from './components/campaign-summary-text/campaign-summary-text.component';
import { CampaignRulesViewComponent } from './components/campaign-rules-view/campaign-rules-view.component';
import { CampaignMainMetricsComponent } from './components/campaign-main-metrics/campaign-main-metrics.component';
import { CampaignTableComponent } from './components/campaign-table/campaign-table.component';

@NgModule({
  declarations: [
    CampaignAutoCompleteComponent,
    CampaignContactsComponent,
    CampaignRetributionViewComponent,
    CampaignMainStatsViewComponent,
    CampaignSummaryTextComponent,
    CampaignRulesViewComponent,
    CampaignMainMetricsComponent,
    CampaignTableComponent,
  ],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, ChartjsModule, RouterModule],
  exports: [
    CampaignAutoCompleteComponent,
    CampaignContactsComponent,
    CampaignRetributionViewComponent,
    CampaignRulesViewComponent,
    CampaignSummaryTextComponent,
    CampaignMainMetricsComponent,
    CampaignTableComponent,
  ],
})
export class CampaignUiModule {}
