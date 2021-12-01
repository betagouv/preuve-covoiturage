import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CertificateLayoutComponent } from './certificate-layout/certificate-layout.component';
import { CheckComponent } from './pages/check/check.component';

const routes: Routes = [
  {
    path: '',
    component: CertificateLayoutComponent,
    children: [
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
