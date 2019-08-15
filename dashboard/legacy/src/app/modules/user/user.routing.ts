import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserListComponent } from './pages/list/component';
import { UserSettingsComponent } from './pages/settings/component';

const routes: Routes = [
  {
    path: 'admin',
    component: UserListComponent,
    data: { groups: ['registry'] },
  },
  {
    path: 'settings',
    component: UserSettingsComponent,
    data: { groups: ['users'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
