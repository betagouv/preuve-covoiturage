import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';
import { CampaignDashboardComponent } from './pages/campaign-dashboard/campaign-dashboard.component';
import { CampaignCreateEditComponent } from './pages/campaign-create-edit/campaign-create-edit.component';
import { CampaignAdminListComponent } from './pages/campaign-admin-list/campaign-admin-list.component';
import { CampaignViewComponent } from './pages/campaign-view/campaign-view.component';

const routes: Routes = [
  {
    path: '',
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: CampaignDashboardComponent,
        data: { groups: [Groups.Territory, Groups.Registry] },
      },
      {
        path: 'list',
        component: CampaignAdminListComponent,
        data: { groups: [Groups.Registry] },
      },
      {
        path: 'create',
        component: CampaignCreateEditComponent,
        data: { roles: [Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.RegistryAdmin] },
      },
      {
        path: 'create/:parentId',
        component: CampaignCreateEditComponent,
        data: { roles: [Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.RegistryAdmin] },
      },
      {
        path: 'edit/:campaignId',
        component: CampaignCreateEditComponent,
        data: { roles: [Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.RegistryAdmin] },
      },
      {
        path: ':campaignId',
        component: CampaignViewComponent,
        data: { groups: [Groups.Territory, Groups.Registry] },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
