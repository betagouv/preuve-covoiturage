import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { TripRoutingModule } from '~/modules/trip/trip-routing.module';
import { MaterialModule } from '~/shared/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { UiTripModule } from '~/modules/trip/ui-trip/ui-trip.module';

import { TripLayoutComponent } from './trip-layout/trip-layout.component';
import { TripStatsComponent } from './pages/trip-stats/trip-stats.component';
import { TripMapsComponent } from './pages/trip-maps/trip-maps.component';
import { TripListComponent } from './pages/trip-list/trip-list.component';

@NgModule({
  declarations: [TripLayoutComponent, TripStatsComponent, TripMapsComponent, TripListComponent],
  imports: [TripRoutingModule, CommonModule, MaterialModule, SharedModule, UiTripModule, InfiniteScrollModule],
})
export class TripModule {}
