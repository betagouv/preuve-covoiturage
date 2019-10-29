import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

import { NotFoundComponent } from '~/core/components/not-found/not-found.component';

// tslint:disable-next-line:max-line-length
import { NotAuthenticatedLayoutComponent } from './core/components/not-authenticated-layout/not-authenticated-layout.component';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout.component';

const routes: Routes = [
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
        path: 'registry',
        loadChildren: () => import('./modules/registry/registry.module').then((mod) => mod.RegistryModule),
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
      {
        path: '',
        loadChildren: () => import('./modules/stat/stat.module').then((mod) => mod.StatModule),
      },
    ],
  },
  {
    path: '404',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        component: NotFoundComponent,
      },
    ],
  },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
