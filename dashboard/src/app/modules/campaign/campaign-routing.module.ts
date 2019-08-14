import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CampaignDashboardComponent } from '~/modules/campaign/pages/campaign-dashboard/campaign-dashboard.component';
// tslint:disable-next-line:max-line-length
import { CampaignCreateEditComponent } from '~/modules/campaign/pages/campaign-create-edit/campaign-create-edit.component';

const routes: Routes = [
  {
    path: '',
    component: CampaignDashboardComponent,
  },
  {
    path: 'create',
    component: CampaignCreateEditComponent,
  },
  {
    path: ':campaignId',
    component: CampaignCreateEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CampaignRoutingModule {}
