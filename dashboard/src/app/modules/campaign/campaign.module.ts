/* eslint-disable max-len */
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgModule } from '@angular/core';
import { NouisliderModule } from 'ng2-nouislider';

import { CampaignInseeFilterStartEndFormComponent } from '~/modules/campaign/components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter-start-end-form/campaign-insee-filter-start-end-form.component';
import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { CampaignUiModule } from '~/modules/campaign/modules/campaign-ui/campaign-ui.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { ParametersFormComponent } from '~/modules/campaign/components/campaign-form/step-3/parameters-form.component';
import { SharedModule } from '~/shared/shared.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { TerritoriesToInseesAutocompleteComponent } from '~/shared/modules/territory-to-insees-autocomplete/components/territories-to-insees-autocomplete/territories-to-insees-autocomplete.component';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';

import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';
import { CampaignCardComponent } from './components/campaign-card/campaign-card.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignDiscoverComponent } from './pages/campaign-discover/campaign-discover.component';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { CampaignInseeFilterComponent } from './components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter.component';
import { CampaignInseeFilterStartEndViewComponent } from './components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter-start-end-view/campaign-insee-filter-start-end-view.component';
import { CampaignMapComponent } from './components/campaign-map/campaign-map.component';
import { CampaignMenuComponent } from './components/campaign-menu/campaign-menu.component';
import { CampaignSimulationPaneComponent } from './components/campaign-simulation-pane/campaign-simulation-pane.component';
import { CampaignsListComponent } from './modules/campaign-ui/components/campaigns-list/campaigns-list.component';
import { CampaignTemplatesComponent } from './components/campaign-form/step-1/campaign-templates.component';
import { CampaignViewComponent } from './pages/campaign-view/campaign-view.component';
import { FiltersFormComponent } from './components/campaign-form/step-2/filters-form.component';
import { RestrictionFormComponent } from './components/campaign-form/step-3/restriction-form/restriction-form.component';
import { RetributionFormComponent } from './components/campaign-form/step-3/retribution-form/retribution-form.component';
import { StaggeredFormComponent } from './components/campaign-form/step-3/staggered-form/staggered-form.component';
import { SummaryFormComponent } from './components/campaign-form/step-4/summary-form.component';

@NgModule({
  declarations: [
    CampaignAdminListComponent,
    CampaignCardComponent,
    CampaignCreateEditComponent,
    CampaignDashboardComponent,
    CampaignDiscoverComponent,
    CampaignFormComponent,
    CampaignInseeFilterComponent,
    CampaignInseeFilterStartEndFormComponent,
    CampaignInseeFilterStartEndViewComponent,
    CampaignMapComponent,
    CampaignMenuComponent,
    CampaignSimulationPaneComponent,
    CampaignsListComponent,
    CampaignTemplatesComponent,
    CampaignViewComponent,
    FiltersFormComponent,
    ParametersFormComponent,
    RestrictionFormComponent,
    RetributionFormComponent,
    StaggeredFormComponent,
    SummaryFormComponent,
    TerritoriesToInseesAutocompleteComponent,
  ],
  imports: [
    CampaignRoutingModule,
    CampaignUiModule,
    CommonModule,
    FormsModule,
    MaterialModule,
    MatPaginatorModule,
    NouisliderModule,
    OperatorUiModule,
    ReactiveFormsModule,
    SharedModule,
    StatUIModule,
    TerritoryUiModule,
    UiTripModule,
  ],
  providers: [CurrencyPipe, DecimalPipe],
  exports: [CampaignsListComponent, TerritoriesToInseesAutocompleteComponent],
})
export class CampaignModule {}
