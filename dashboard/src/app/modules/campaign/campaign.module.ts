// tslint:disable:max-line-length
import { NouisliderModule } from 'ng2-nouislider';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material';

import { CampaignRoutingModule } from '~/modules/campaign/campaign-routing.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { TerritoriesToInseesAutocompleteComponent } from '~/shared/modules/territory-to-insees-autocomplete/components/territories-to-insees-autocomplete/territories-to-insees-autocomplete.component';
import { CampaignInseeFilterStartEndFormComponent } from '~/modules/campaign/components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter-start-end-form/campaign-insee-filter-start-end-form.component';
import { ParametersFormComponent } from '~/modules/campaign/components/campaign-form/step-3/parameters-form.component';
import { CampaignUiModule } from '~/modules/campaign/modules/campaign-ui/campaign-ui.module';

import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignMenuComponent } from './components/campaign-menu/campaign-menu.component';
import { CampaignsListComponent } from './modules/campaign-ui/components/campaigns-list/campaigns-list.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { CampaignTemplatesComponent } from './components/campaign-form/step-1/campaign-templates.component';
import { FiltersFormComponent } from './components/campaign-form/step-2/filters-form.component';
import { SummaryFormComponent } from './components/campaign-form/step-4/summary-form.component';
// tslint:disable-next-line:max-line-length
import { RestrictionFormComponent } from './components/campaign-form/step-3/restriction-form/restriction-form.component';
// tslint:disable-next-line:max-line-length
import { RetributionFormComponent } from './components/campaign-form/step-3/retribution-form/retribution-form.component';
import { StaggeredFormComponent } from './components/campaign-form/step-3/staggered-form/staggered-form.component';
import { CampaignDiscoverComponent } from './pages/campaign-discover/campaign-discover.component';
import { CampaignCardComponent } from './components/campaign-card/campaign-card.component';
import { CampaignMapComponent } from './components/campaign-map/campaign-map.component';
import { CampaignInseeFilterComponent } from './components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter.component';
import { CampaignInseeFilterStartEndViewComponent } from './components/campaign-form/step-2/campaign-insee-filter/campaign-insee-filter-start-end-view/campaign-insee-filter-start-end-view.component';
import { CampaignDraftViewComponent } from './pages/campaign-draft-view/campaign-draft-view.component';
import { CampaignActiveViewComponent } from './pages/campaign-active-view/campaign-active-view.component';
import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';

@NgModule({
  declarations: [
    CampaignDashboardComponent,
    CampaignMenuComponent,
    CampaignsListComponent,
    CampaignCreateEditComponent,
    CampaignFormComponent,
    CampaignTemplatesComponent,
    FiltersFormComponent,
    ParametersFormComponent,
    SummaryFormComponent,
    RestrictionFormComponent,
    RetributionFormComponent,
    StaggeredFormComponent,
    CampaignDiscoverComponent,
    CampaignCardComponent,
    CampaignMapComponent,
    CampaignInseeFilterComponent,
    CampaignInseeFilterStartEndFormComponent,
    TerritoriesToInseesAutocompleteComponent,
    CampaignInseeFilterStartEndViewComponent,
    CampaignDraftViewComponent,
    CampaignActiveViewComponent,
    CampaignAdminListComponent,
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
    TerritoryUiModule,
    OperatorUiModule,
    CampaignUiModule,
    MatPaginatorModule,
  ],
  providers: [CurrencyPipe, DecimalPipe],
  exports: [CampaignsListComponent, TerritoriesToInseesAutocompleteComponent],
})
export class CampaignModule {}
