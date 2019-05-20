import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AomStatisticsComponent } from '~/modules/aom/pages/statistics/component';

import { AomListComponent } from './pages/list/component';
import { AomSettingsComponent } from './pages/settings/component';

const routes: Routes = [
  {
    path: 'admin',
    component: AomListComponent,
    data: { groups: ['registry'] },
  },
  {
    path : 'settings',
    component: AomSettingsComponent,
    data: { groups: ['aom'] },
  },
  {
    path : 'stats',
    component: AomStatisticsComponent,
    data: { groups: ['aom'] },
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
