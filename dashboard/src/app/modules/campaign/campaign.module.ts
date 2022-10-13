/* eslint-disable max-len */
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NouisliderModule } from 'ng2-nouislider';
import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { CampaignUiModule } from '~/modules/campaign/modules/campaign-ui/campaign-ui.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';
import { MaterialModule } from '../../shared/modules/material/material.module';
import { SharedModule } from '../../shared/shared.module';
import { CampaignSimulationPaneComponent } from './components/campaign-simulation-pane/campaign-simulation-pane.component';
import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';
import { CampaignViewComponent } from './pages/campaign-view/campaign-view.component';
import { CampaignFundingRequestsComponent } from './pages/campaign-fundingrequests/campaign-fundingrequests.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    CampaignAdminListComponent,
    CampaignFundingRequestsComponent,
    CampaignSimulationPaneComponent,
    CampaignViewComponent,
  ],
  imports: [
    CampaignRoutingModule,
    CampaignUiModule,
    CommonModule,
    FormsModule,
    MaterialModule,
    MatPaginatorModule,
    MatTableModule,
    NouisliderModule,
    OperatorUiModule,
    ReactiveFormsModule,
    SharedModule,
    StatUIModule,
    TerritoryUiModule,
    UiTripModule,
  ],
  providers: [CurrencyPipe, DecimalPipe],
})
export class CampaignModule {}
