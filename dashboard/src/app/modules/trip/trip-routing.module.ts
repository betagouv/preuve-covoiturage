import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TripExportComponent } from '~/modules/trip/pages/trip-export/trip-export.component';

import { TripStatsComponent } from './pages/trip-stats/trip-stats.component';
import { TripMapsComponent } from './pages/trip-maps/trip-maps.component';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripImportComponent } from './pages/trip-import/trip-import.component';
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
        path: 'import',
        component: TripImportComponent,
      },
      {
        path: 'export',
        component: TripExportComponent,
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
