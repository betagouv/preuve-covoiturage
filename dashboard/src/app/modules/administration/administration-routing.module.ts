import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

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
        path: 'territory',
        component: TerritoryComponent,
      },
      {
        path: 'users',
        data: { role: 'admin' },
        component: UsersComponent,
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
