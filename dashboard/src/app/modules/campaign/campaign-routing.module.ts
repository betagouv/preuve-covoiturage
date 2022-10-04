import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Groups } from '~/core/enums/user/groups';
import { AuthGuard } from '~/core/guards/auth-guard.service';
import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';
import { CampaignViewComponent } from './pages/campaign-view/campaign-view.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: CampaignAdminListComponent,
        data: { groups: [Groups.Territory, Groups.Registry, Groups.Operator] },
      },
      {
        path: ':campaignId',
        component: CampaignViewComponent,
        data: { groups: [Groups.Territory, Groups.Registry, Groups.Operator] },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
