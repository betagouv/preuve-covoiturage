import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { RegistryLayoutComponent } from './registry-layout/registry-layout.component';

const routes: Routes = [
  {
    path: '',
    component: RegistryLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
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
export class RegistryRoutingModule {}
