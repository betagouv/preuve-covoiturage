import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { RegisterLayoutComponent } from '~/modules/register/register-layout/register-layout.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      // {
      //   path: 'profile',
      //   component: ProfileComponent,
      // },
      // {
      //   path: 'territory',
      //   component: TerritoryComponent,
      // },
      // {
      //   path: 'users',
      //   data: { role: 'admin' },
      //   component: UsersComponent,
      // },
      // {
      //   path: '',
      //   redirectTo: 'profile',
      //   pathMatch: 'full',
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterRoutingModule {}
