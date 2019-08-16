import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

// tslint:disable-next-line:max-line-length
import { NotAuthenticatedLayoutComponent } from './core/components/not-authenticated-layout/not-authenticated-layout.component';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'campaign',
        loadChildren: () => import('./modules/campaign/campaign.module').then((mod) => mod.CampaignModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'trip',
        loadChildren: () => import('./modules/trip/trip.module').then((mod) => mod.TripModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/administration/administration.module').then((mod) => mod.AdministrationModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'ui-guide',
        loadChildren: () => import('./modules/ui-guide/ui-guide.module').then((mod) => mod.UiGuideModule),
      },
    ],
  },
  {
    path: '',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/authentication/authentication.module').then((mod) => mod.AuthenticationModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
