import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';

import { UserListComponent } from './pages/list/component';
import { UserSettingsComponent } from './pages/settings/component';

const routes: Routes = [
  {
    path: 'admin/users',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: UserListComponent,
        data: { groups: ['registry'] },
      },
    ],
  },
  {
    path: 'dashboard/profil',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path : '',
        component: UserSettingsComponent,
        data: { groups: ['users'] },
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

export class UserRoutingModule { }
