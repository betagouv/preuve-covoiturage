// tslint:disable:max-line-length
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

import { CampaignDashboardComponent } from '~/modules/campaign/pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignCreateEditComponent } from '~/modules/campaign/pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignDiscoverComponent } from '~/modules/campaign/pages/campaign-discover/campaign-discover.component';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignDraftViewComponent } from '~/modules/campaign/pages/campaign-draft-view/campaign-draft-view.component';
import { CampaignActiveViewComponent } from '~/modules/campaign/pages/campaign-active-view/campaign-active-view.component';
import { CampaignAdminListComponent } from '~/modules/campaign/pages/campaign-admin-list/campaign-admin-list.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        data: { groups: [UserGroupEnum.TERRITORY] },
        component: CampaignDashboardComponent,
      },
      {
        path: 'create',
        data: { role: 'admin', groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'list',
        data: { groups: [UserGroupEnum.REGISTRY] },
        component: CampaignAdminListComponent,
      },
      {
        path: 'create/:parentId',
        data: { role: 'admin', groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'discover',
        data: { groups: [UserGroupEnum.TERRITORY] },
        component: CampaignDiscoverComponent,
      },
      {
        path: 'edit/:campaignId',
        data: { role: 'admin', groups: [UserGroupEnum.TERRITORY] },
        component: CampaignCreateEditComponent,
      },
      {
        path: 'draft/:campaignId',
        data: { groups: [UserGroupEnum.TERRITORY] },
        component: CampaignDraftViewComponent,
      },
      {
        path: ':campaignId',
        component: CampaignActiveViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
