import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignDiscoverComponent } from './pages/campaign-discover/campaign-discover.component';
import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';
import { CampaignViewComponent } from './pages/campaign-view/campaign-view.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        data: { groups: [UserGroupEnum.TERRITORY, UserGroupEnum.REGISTRY] },
        component: CampaignDashboardComponent,
      },
      {
        path: 'list',
        data: { groups: [UserGroupEnum.REGISTRY] },
        component: CampaignAdminListComponent,
      },
      {
        path: 'create',
        data: { permissions: ['incentive-campaign.create'], groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'create/:parentId',
        data: { permissions: ['incentive-campaign.create'], groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'discover',
        data: { groups: [UserGroupEnum.TERRITORY] },
        component: CampaignDiscoverComponent,
      },
      {
        path: 'edit/:campaignId',
        data: { permissions: ['incentive-campaign.update'], groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: ':campaignId',
        data: { permissions: ['incentive-campaign.read'] },
        component: CampaignViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
