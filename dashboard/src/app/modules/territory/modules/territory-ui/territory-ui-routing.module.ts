import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Roles } from '~/core/enums/user/roles';
import { AuthGuard } from '~/core/guards/auth-guard.service';
import { Groups } from '../../../../core/enums/user/groups';
import { TerritoryResolver } from './components/territory-details/territory-resolver';
import { TerritoryFormComponent } from './components/territory-form/territory-form.component';
import { TerritoryListViewComponent } from './components/territory-list-view/territory-list-view.component';

const routes: Routes = [
  {
    path: '',
    component: TerritoryListViewComponent,
    canActivate: [AuthGuard],
    data: { groups: [Groups.Registry], roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
  {
    path: 'create',
    component: TerritoryFormComponent,
    canActivate: [AuthGuard],
    data: { groups: [Groups.Registry], roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
  {
    path: ':id',
    component: TerritoryFormComponent,
    resolve: {
      territory: TerritoryResolver,
    },
    canActivate: [AuthGuard],
    data: { groups: [Groups.Registry], roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TerritoryUiRoutingModule {}
