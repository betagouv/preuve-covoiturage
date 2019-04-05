import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';
import { IncentiveCampaignsListPageComponent } from '~/modules/incentive/pages/campaigns/list/component';

import { IncentivePoliciesCreatePageComponent } from './pages/policies/create/component';
import { IncentivePoliciesListPageComponent } from './pages/policies/list/component';
import { IncentiveCampaignsCreatePageComponent } from './pages/campaigns/create/component';

const routes: Routes = [
  {
    path: 'dashboard/incentive-policies',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { groups: ['aom', 'registry'] },
    children: [
      {
        path: '',
        component: IncentivePoliciesListPageComponent,
      },
      {
        path: 'new',
        component: IncentivePoliciesCreatePageComponent,
      },
    ],
  },
  {
    path: 'dashboard/incentive-campaigns',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { groups: ['aom', 'registry'] },
    children: [
      {
        path: '',
        component: IncentiveCampaignsListPageComponent,
      },
      {
        path: 'new',
        component: IncentiveCampaignsCreatePageComponent,
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

export class IncentiveRoutingModule { }
