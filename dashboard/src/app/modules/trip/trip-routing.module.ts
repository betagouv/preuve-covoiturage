import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roles } from '~/core/enums/user/roles';
import { TripExportComponent } from '~/modules/trip/pages/trip-export/trip-export.component';
import { TripListComponent } from './pages/trip-list/trip-list.component';
import { TripStatsComponent } from './pages/trip-stats/trip-stats.component';
import { TripLayoutComponent } from './trip-layout/trip-layout.component';

const routes: Routes = [
  {
    path: '',
    component: TripLayoutComponent,
    children: [
      {
        path: 'stats',
        component: TripStatsComponent,
        data: {
          roles: [
            Roles.TerritoryAdmin,
            Roles.TerritoryUser,
            Roles.OperatorAdmin,
            Roles.OperatorUser,
            Roles.RegistryAdmin,
            Roles.RegistryUser,
          ],
        },
      },
      {
        path: 'list',
        component: TripListComponent,
        data: {
          roles: [
            Roles.TerritoryAdmin,
            Roles.TerritoryUser,
            Roles.OperatorAdmin,
            Roles.OperatorUser,
            Roles.RegistryAdmin,
            Roles.RegistryUser,
          ],
        },
      },
      {
        path: 'export',
        component: TripExportComponent,
        data: {
          roles: [
            Roles.TerritoryAdmin,
            Roles.TerritoryUser,
            Roles.OperatorAdmin,
            Roles.OperatorUser,
            Roles.RegistryAdmin,
            Roles.RegistryUser,
          ],
        },
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
