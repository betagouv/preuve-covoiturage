import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { MaterialModule } from '~/shared/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/ui-trip/ui-trip.module';

import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignMenuComponent } from './components/campaign-menu/campaign-menu.component';
import { CampaignsListComponent } from './components/campaigns-list/campaigns-list.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';

@NgModule({
  declarations: [
    CampaignDashboardComponent,
    CampaignMenuComponent,
    CampaignsListComponent,
    CampaignCreateEditComponent,
  ],
  imports: [CampaignRoutingModule, CommonModule, MaterialModule, SharedModule, UiTripModule],
})
export class CampaignModule {}
