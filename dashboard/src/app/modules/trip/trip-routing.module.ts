import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TripStatsComponent } from '~/modules/trip/pages/trip-stats/trip-stats.component';
import { TripMapsComponent } from '~/modules/trip/pages/trip-maps/trip-maps.component';
import { TripListComponent } from '~/modules/trip/pages/trip-list/trip-list.component';

import { TripLayoutComponent } from './trip-layout/trip-layout.component';

const routes: Routes = [
  {
    path: '',
    component: TripLayoutComponent,
    children: [
      {
        path: 'stats',
        component: TripStatsComponent,
      },
      {
        path: 'maps',
        component: TripMapsComponent,
      },
      {
        path: 'list',
        component: TripListComponent,
      },
      {
        path: '',
        redirectTo: 'stats',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripRoutingModule {}
