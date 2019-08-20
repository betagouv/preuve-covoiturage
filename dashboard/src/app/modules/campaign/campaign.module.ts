import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';

import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';
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
import { RestrictionFormComponent } from './components/campaign-form/restriction-form/restriction-form.component';
import { RetributionFormComponent } from './components/campaign-form/retribution-form/retribution-form.component';
import { StaggeredFormComponent } from './components/campaign-form/staggered-form/staggered-form.component';

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
    RestrictionFormComponent,
    RetributionFormComponent,
    StaggeredFormComponent,
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
    NouisliderModule,
  ],
  providers: [CurrencyPipe, DecimalPipe],
})
export class CampaignModule {}
