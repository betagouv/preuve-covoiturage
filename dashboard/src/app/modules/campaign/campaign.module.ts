import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { MaterialModule } from '~/shared/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/ui-trip/ui-trip.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';

import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignMenuComponent } from './components/campaign-menu/campaign-menu.component';
import { CampaignsListComponent } from './components/campaigns-list/campaigns-list.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { PolicyFormComponent } from './components/campaign-form/policy-form/policy-form.component';
import { RulesFormComponent } from './components/campaign-form/rules-form/rules-form.component';
import { ParametersFormComponent } from './components/campaign-form/parameters-form/parameters-form.component';
import { SummaryFormComponent } from './components/campaign-form/summary-form/summary-form.component';

@NgModule({
  declarations: [
    CampaignDashboardComponent,
    CampaignMenuComponent,
    CampaignsListComponent,
    CampaignCreateEditComponent,
    CampaignFormComponent,
    PolicyFormComponent,
    RulesFormComponent,
    ParametersFormComponent,
    SummaryFormComponent,
  ],
  imports: [
    CampaignRoutingModule,
    CommonModule,
    MaterialModule,
    SharedModule,
    UiTripModule,
    StatUIModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class CampaignModule {}
