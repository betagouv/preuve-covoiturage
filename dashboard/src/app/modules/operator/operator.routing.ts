import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';

import { OperatorListComponent } from './pages/list/component';
import { TokenComponent } from './pages/token/component';
import { OperatorSettingsComponent } from './pages/settings/component';

const routes: Routes = [
  {
    path: 'admin/operators',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: OperatorListComponent,
        data: { groups: ['registry'] },
      },
    ],
  },
  {
    path: 'admin/tokens',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: TokenComponent,
        data: { groups: ['operators'] },
      },
    ],
  },
  {
    path: 'dashboard/operator',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path : '',
        component: OperatorSettingsComponent,
        data: { groups: ['operators'] },
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

export class OperatorRoutingModule { }
