import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Roles } from '~/core/enums/user/roles';
import { AuthGuard } from '~/core/guards/auth-guard.service';

import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
  {
    path: 'create',
    component: CreateComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
  {
    path: ':id',
    component: EditComponent,
    canActivate: [AuthGuard],
    data: { roles: [Roles.RegistryAdmin, Roles.OperatorAdmin, Roles.TerritoryAdmin] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
