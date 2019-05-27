import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from '~/shared/layout/main/component';

import { AuthGuard } from './applicativeService/authguard/service';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard/home', pathMatch: 'full' },
  {
    path: '',
    loadChildren: './modules/auth/auth.module#AuthModule',
  },
  {
    path: 'dashboard/journeys',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/journeys/journey.module#JourneyModule',
  },
  {
    path: 'dashboard/incentives',
    component: LayoutComponent,
    data: { groups: ['aom', 'registry'] },
    canActivate: [AuthGuard],
    loadChildren: './modules/incentive/incentive.module#IncentiveModule',
  },
  {
    path: 'dashboard/operators',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/operator/operator.module#OperatorModule',
  },
  {
    path: 'dashboard/aoms',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/aom/aom.module#AomModule',
  },
  {
    path: 'dashboard/users',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/user/user.module#UserModule',
  },
  {
    path: 'dashboard/registry',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/registry/registry.module#RegistryModule',
  },
  {
    path: 'dashboard/home',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './modules/home/home.module#HomeModule',
  },
  {
    path: 'stats',
    loadChildren: './modules/statistics/statistics.module#StatisticsModule',
  },
  {
    path: 'statistics',
    redirectTo: 'stats',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
