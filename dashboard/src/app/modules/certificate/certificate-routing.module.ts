// tslint:disable:max-line-length
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { CertificateLayoutComponent } from './certificate-layout/certificate-layout.component';
import { GenerateComponent } from './pages/generate/generate.component';
import { CheckComponent } from './pages/check/check.component';
import { MemeComponent } from './pages/meme/meme.component';

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
        path: '8a9d2da9-39e3-4db7-be8e-12b4d2179fda',
        component: MemeComponent,
      },
      {
        path: ':uuid',
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
