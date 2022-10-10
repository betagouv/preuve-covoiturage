/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '~/core/components/not-found/not-found.component';
import { AuthGuard } from '~/core/guards/auth-guard.service';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout.component';
import { NotAuthenticatedLayoutComponent } from './core/components/not-authenticated-layout/not-authenticated-layout.component';
import { ServiceUnavailableComponent } from './core/components/service-unavailable/service-unavailable.component';
import { AdministrationModule } from './modules/administration/administration.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { LogoutComponent } from './modules/logout/logout.component';
import { RegistryModule } from './modules/registry/registry.module';
import { StatModule } from './modules/stat/stat.module';
import { TerritoryDemoHomeModule } from './modules/territory-demo-home/territory-demo-home.module';
import { TripModule } from './modules/trip/trip.module';

const routes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always', // make sure the user validity is checked on every page access
    children: [
      {
        path: 'campaign',
        canLoad: [AuthGuard],
        // prettier-ignore
        loadChildren: (): Promise<CampaignModule> => import('./modules/campaign/campaign.module').then((mod) => mod.CampaignModule),
      },

      {
        path: 'registry',
        canLoad: [AuthGuard],
        // prettier-ignore
        loadChildren: (): Promise<RegistryModule> => import('./modules/registry/registry.module').then((mod) => mod.RegistryModule),
      },
      {
        path: 'trip',
        canLoad: [AuthGuard],
        // prettier-ignore
        loadChildren: (): Promise<TripModule> => import('./modules/trip/trip.module').then((mod) => mod.TripModule),
      },
      {
        path: 'admin',
        canLoad: [AuthGuard],
        // prettier-ignore
        loadChildren: (): Promise<AdministrationModule> => import('./modules/administration/administration.module').then((mod) => mod.AdministrationModule),
      },
      {
        path: 'demo',
        canLoad: [AuthGuard],
        // prettier-ignore
        loadChildren: (): Promise<TerritoryDemoHomeModule> => import('./modules/territory-demo-home/territory-demo-home.module').then((mod) => mod.TerritoryDemoHomeModule),
      },
    ],
  },
  {
    path: '',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: '',
        // prettier-ignore
        loadChildren: (): Promise<AuthenticationModule> => import('./modules/authentication/authentication.module').then((mod) => mod.AuthenticationModule),
      },
      {
        path: '',
        // prettier-ignore
        loadChildren: (): Promise<StatModule> => import('./modules/stat/stat.module').then((mod) => mod.StatModule),
      },
      {
        path: 'attestation',
        // prettier-ignore
        loadChildren: (): Promise<CertificateModule> => import('./modules/certificate/certificate.module').then((mod) => mod.CertificateModule),
      },
    ],
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: '404',
    component: NotAuthenticatedLayoutComponent,
    children: [{ path: '', component: NotFoundComponent }],
  },
  {
    path: '503',
    component: NotAuthenticatedLayoutComponent,
    children: [{ path: '', component: ServiceUnavailableComponent }],
  },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
