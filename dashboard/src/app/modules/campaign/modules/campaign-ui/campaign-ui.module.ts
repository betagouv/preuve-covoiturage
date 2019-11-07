// tslint:disable:max-line-length
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartjsModule } from '@ctrl/ngx-chartjs';

import { MaterialModule } from '~/shared/modules/material/material.module';

import { CampaignAutoCompleteComponent } from './components/campaign-auto-complete/campaign-auto-complete.component';
import { CampaignContactsComponent } from './components/campaign-contacts/campaign-contacts.component';
import { CampaignRetributionViewComponent } from './components/campaign-retribution-view/campaign-retribution-view.component';
import { CampaignMainStatsViewComponent } from './components/campaign-main-stats-view/campaign-main-stats-view.component';
import { CampaignSummaryTextComponent } from './components/campaign-summary-text/campaign-summary-text.component';
import { CampaignRulesViewComponent } from './components/campaign-rules-view/campaign-rules-view.component';
import { CampaignMainMetricsComponent } from './components/campaign-main-metrics/campaign-main-metrics.component';

@NgModule({
  declarations: [
    CampaignAutoCompleteComponent,
    CampaignContactsComponent,
    CampaignRetributionViewComponent,
    CampaignMainStatsViewComponent,
    CampaignSummaryTextComponent,
    CampaignRulesViewComponent,
    CampaignMainMetricsComponent,
  ],
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, ChartjsModule],
  exports: [
    CampaignAutoCompleteComponent,
    CampaignContactsComponent,
    CampaignRetributionViewComponent,
    CampaignRulesViewComponent,
    CampaignSummaryTextComponent,
    CampaignMainMetricsComponent,
  ],
})
export class CampaignUiModule {}
