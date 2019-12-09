import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ReactiveFormsModule } from '@angular/forms';

import { TripRoutingModule } from '~/modules/trip/trip-routing.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/modules/ui-trip/ui-trip.module';
import { StatUIModule } from '~/modules/stat/modules/stat-ui/stat-ui.module';
import { FilterModule } from '~/modules/filter/filter.module';
import { CampaignModule } from '~/modules/campaign/campaign.module';
import { TripExportComponent } from '~/modules/trip/pages/trip-export/trip-export.component';

import { TripLayoutComponent } from './trip-layout/trip-layout.component';
import { TripStatsComponent } from './pages/trip-stats/trip-stats.component';
import { TripMapsComponent } from './pages/trip-maps/trip-maps.component';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripImportComponent } from './pages/trip-import/trip-import.component';

@NgModule({
  declarations: [
    TripLayoutComponent,
    TripStatsComponent,
    TripMapsComponent,
    TripListComponent,
    TripImportComponent,
    TripExportComponent,
  ],
  imports: [
    TripRoutingModule,
    CommonModule,
    FilterModule,
    MaterialModule,
    SharedModule,
    UiTripModule,
    InfiniteScrollModule,
    StatUIModule,
    CampaignModule,
    ReactiveFormsModule,
  ],
})
export class TripModule {}
