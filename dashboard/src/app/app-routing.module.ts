import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';

import { NotFoundComponent } from '~/core/components/not-found/not-found.component';
import { ServiceUnavailableComponent } from './core/components/service-unavailable/service-unavailable.component';

// eslint-disable-next-line
import { NotAuthenticatedLayoutComponent } from './core/components/not-authenticated-layout/not-authenticated-layout.component';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout.component';
import { CampaignModule } from './modules/campaign/campaign.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { RegistryModule } from './modules/registry/registry.module';
import { TripModule } from './modules/trip/trip.module';
import { AdministrationModule } from './modules/administration/administration.module';
import { UiGuideModule } from './modules/ui-guide/ui-guide.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { StatModule } from './modules/stat/stat.module';

const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'campaign',
        loadChildren: (): Promise<CampaignModule> =>
          import('./modules/campaign/campaign.module').then((mod) => mod.CampaignModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'certificate',
        loadChildren: (): Promise<CertificateModule> =>
          import('./modules/certificate/certificate.module').then((mod) => mod.CertificateModule),
      },
      {
        path: 'registry',
        loadChildren: (): Promise<RegistryModule> =>
          import('./modules/registry/registry.module').then((mod) => mod.RegistryModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'trip',
        loadChildren: (): Promise<TripModule> => import('./modules/trip/trip.module').then((mod) => mod.TripModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'admin',
        loadChildren: (): Promise<AdministrationModule> =>
          import('./modules/administration/administration.module').then((mod) => mod.AdministrationModule),
        canLoad: [AuthGuard],
      },
      {
        path: 'ui-guide',
        loadChildren: (): Promise<UiGuideModule> =>
          import('./modules/ui-guide/ui-guide.module').then((mod) => mod.UiGuideModule),
      },
    ],
  },
  {
    path: '',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: (): Promise<AuthenticationModule> =>
          import('./modules/authentication/authentication.module').then((mod) => mod.AuthenticationModule),
      },
      {
        path: '',
        loadChildren: (): Promise<StatModule> => import('./modules/stat/stat.module').then((mod) => mod.StatModule),
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
  {
    path: '503',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        component: ServiceUnavailableComponent,
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
