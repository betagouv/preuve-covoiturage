import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { Roles } from '../../core/enums/user/roles';
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
        data: {
          roles: [
            Roles.TerritoryAdmin,
            Roles.TerritoryUser,
            Roles.OperatorAdmin,
            Roles.OperatorUser,
            Roles.RegistryAdmin,
            Roles.RegistryUser,
          ],
        },
      },
      {
        path: ':campaignId',
        component: CampaignViewComponent,
        data: {
          roles: [
            Roles.TerritoryAdmin,
            Roles.TerritoryUser,
            Roles.OperatorAdmin,
            Roles.OperatorUser,
            Roles.RegistryAdmin,
            Roles.RegistryUser,
          ],
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
