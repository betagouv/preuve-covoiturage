import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { ApiComponent } from '~/modules/administration/pages/api/api.component';
import { AllUsersComponent } from '~/modules/administration/pages/all-users/all-users.component';

import { OperatorComponent } from './pages/operator/operator.component';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';
import { UsersComponent } from './pages/users/users.component';

const routes: Routes = [
  {
    path: '',
    component: AdministrationLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'operator',
        component: OperatorComponent,
      },
      {
        path: 'api',
        component: ApiComponent,
      },
      {
        path: 'territory',
        data: { groups: ['territory'] },
        component: TerritoryComponent,
      },
      {
        path: 'users',
        data: { groups: ['territory', 'operator'], role: 'admin' },
        component: UsersComponent,
      },
      {
        path: 'all-users',
        data: { groups: ['registry'], role: 'admin' },
        component: AllUsersComponent,
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
