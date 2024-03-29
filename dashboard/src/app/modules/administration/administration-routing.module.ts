import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';
import { AuthGuard } from '~/core/guards/auth-guard.service';
import { AllOperatorsComponent } from '~/modules/administration/pages/all-operators/all-operators.component';
import { ApiComponent } from '~/modules/administration/pages/api/api.component';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { CertificateListComponent } from './pages/certificate-list/certificate-list.component';
import { OperatorComponent } from './pages/operator/operator.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';

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
        data: { roles: [Roles.OperatorAdmin] },
      },
      {
        path: 'territory',
        component: TerritoryComponent,
        data: { groups: [Groups.Territory] },
      },
      {
        path: 'certificates',
        component: CertificateListComponent,
        data: { roles: [Roles.OperatorAdmin, Roles.RegistryAdmin] },
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'all-territories',
        loadChildren: () =>
          import('../territory/modules/territory-ui/territory-ui.module').then((m) => m.TerritoryUiModule),
      },
      {
        path: 'all-operators',
        component: AllOperatorsComponent,
        data: { groups: [Groups.Registry], roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      { path: '**', redirectTo: '/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministrationRoutingModule {}
