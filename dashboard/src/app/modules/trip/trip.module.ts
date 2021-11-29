import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CampaignModule } from '~/modules/campaign/campaign.module';
import { FilterModule } from '~/modules/filter/filter.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';
import { TripExportComponent } from '~/modules/trip/pages/trip-export/trip-export.component';
import { TripRoutingModule } from '~/modules/trip/trip-routing.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { OperatorUiModule } from '../operator/modules/operator-ui/operator-ui.module';
import { TerritoryUiModule } from '../territory/modules/territory-ui/territory-ui.module';
import { TripExportDialogComponent } from './pages/trip-export-dialog/trip-export-dialog.component';
import { TripImportComponent } from './pages/trip-import/trip-import.component';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripMapsComponent } from './pages/trip-maps/trip-maps.component';
import { TripStatsComponent } from './pages/trip-stats/trip-stats.component';
import { TripLayoutComponent } from './trip-layout/trip-layout.component';

@NgModule({
  declarations: [
    TripLayoutComponent,
    TripStatsComponent,
    TripMapsComponent,
    TripListComponent,
    TripImportComponent,
    TripExportComponent,
    TripExportDialogComponent,
  ],
  imports: [
    TripRoutingModule,
    CommonModule,
    FilterModule,
    MaterialModule,
    SharedModule,
    UiTripModule,
    OperatorUiModule,
    InfiniteScrollModule,
    StatUIModule,
    CampaignModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    TerritoryUiModule,
  ],
})
export class TripModule {}
