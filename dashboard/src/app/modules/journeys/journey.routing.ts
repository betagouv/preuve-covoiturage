import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';

import { JourneyListPageComponent } from './pages/list/component';

const routes: Routes = [
  {
    path: 'dashboard/journeys',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path : '',
        component: JourneyListPageComponent,
        data: { groups: ['aom', 'registry'] },
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

export class JourneyRoutingModule { }
