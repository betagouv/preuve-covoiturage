import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '~/core/guards/auth-guard.service';
import { ApiComponent } from '~/modules/administration/pages/api/api.component';
import { AllUsersComponent } from '~/modules/administration/pages/all-users/all-users.component';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { AllTerritoriesComponent } from '~/modules/administration/pages/all-territories/all-territories.component';
import { AllOperatorsComponent } from '~/modules/administration/pages/all-operators/all-operators.component';

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
        data: { groups: [UserGroupEnum.TERRITORY] },
        component: TerritoryComponent,
      },
      {
        path: 'users',
        data: { groups: [UserGroupEnum.TERRITORY, UserGroupEnum.OPERATOR], role: UserRoleEnum.ADMIN },
        component: UsersComponent,
      },
      {
        path: 'all-users',
        data: { groups: [UserGroupEnum.REGISTRY], role: UserRoleEnum.ADMIN },
        component: AllUsersComponent,
      },
      {
        path: 'all-territories',
        data: { groups: [UserGroupEnum.REGISTRY], role: UserRoleEnum.ADMIN },
        component: AllTerritoriesComponent,
      },
      {
        path: 'all-operators',
        data: { groups: [UserGroupEnum.REGISTRY], role: UserRoleEnum.ADMIN },
        component: AllOperatorsComponent,
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
