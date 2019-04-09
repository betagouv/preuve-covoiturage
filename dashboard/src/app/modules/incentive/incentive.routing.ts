import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncentiveCampaignsListPageComponent } from '~/modules/incentive/pages/campaigns/list/component';

import { IncentivePoliciesCreatePageComponent } from './pages/policies/create/component';
import { IncentivePoliciesListPageComponent } from './pages/policies/list/component';
import { IncentiveCampaignsCreatePageComponent } from './pages/campaigns/create/component';

const routes: Routes = [
  {
    path: 'policies',
    pathMatch: 'full',
    component: IncentivePoliciesListPageComponent,
  },
  {
    path: 'policies/new',
    pathMatch: 'full',
    component: IncentivePoliciesCreatePageComponent,
  },
  {
    path: 'campaigns',
    pathMatch: 'full',
    component: IncentiveCampaignsListPageComponent,
  },
  {
    path: 'campaigns/new',
    pathMatch: 'full',
    component: IncentiveCampaignsCreatePageComponent,
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
