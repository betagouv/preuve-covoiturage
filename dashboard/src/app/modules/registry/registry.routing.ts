import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';

import { RegistryJourneyImportComponent } from './pages/journeyImport/component';

const routes: Routes = [
  {
    path: 'dashboard/registry',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path : 'journey-import',
        component: RegistryJourneyImportComponent,
        data: { groups: ['registry'] },
      },
    ],
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class RegistryRoutingModule { }
