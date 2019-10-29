import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

import { CampaignDashboardComponent } from '~/modules/campaign/pages/campaign-dashboard/campaign-dashboard.component';
// tslint:disable-next-line:max-line-length
import { CampaignCreateEditComponent } from '~/modules/campaign/pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignDiscoverComponent } from '~/modules/campaign/pages/campaign-discover/campaign-discover.component';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

const routes: Routes = [
  {
    path: '',
    data: { groups: [UserGroupEnum.TERRITORY] },
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: CampaignDashboardComponent,
      },
      {
        path: 'create',
        data: { role: 'admin' },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'discover',
        component: CampaignDiscoverComponent,
      },
      {
        path: ':campaignId',
        component: CampaignCreateEditComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
