import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';
import { AomStatisticsComponent } from '~/modules/aom/pages/statistics/component';

import { AomListComponent } from './pages/list/component';
import { AomSettingsComponent } from './pages/settings/component';

const routes: Routes = [
  {
    path: 'admin/aoms',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: AomListComponent,
        data: { groups: ['registry'] },
      },
    ],
  },
  {
    path: 'dashboard/aom',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path : '',
        component: AomSettingsComponent,
        data: { groups: ['aom'] },
      },
      {
        path : 'statistics',
        component: AomStatisticsComponent,
        data: { groups: ['aom'] },
      },
    ],
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class AomRoutingModule { }
