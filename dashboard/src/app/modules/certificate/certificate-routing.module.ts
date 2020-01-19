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

import { CertificateLayoutComponent } from './certificate-layout/certificate-layout.component';
import { GenerateComponent } from './pages/generate/generate.component';
import { CheckComponent } from './pages/check/check.component';

const routes: Routes = [
  {
    path: '',
    component: CertificateLayoutComponent,
    children: [
      {
        path: 'generate',
        data: { groups: [UserGroupEnum.OPERATOR] },
        canActivate: [AuthGuard],
        component: GenerateComponent,
      },
      {
        path: 'check/:certificateUid',
        component: CheckComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificateRoutingModule {}
