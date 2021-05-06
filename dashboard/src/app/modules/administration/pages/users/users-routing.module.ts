import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserManyRoleEnum } from '~/core/enums/user/roles';

import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent,
    data: { role: UserManyRoleEnum.ADMIN },
  },
  {
    path: 'create',
    component: CreateComponent,
    data: { role: UserManyRoleEnum.ADMIN },
  },
  {
    path: ':id',
    component: EditComponent,
    data: { role: UserManyRoleEnum.ADMIN },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
