import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';

import { UsersListComponent } from './components/users-list/users-list.component';
import { CreateEditUserFormComponent } from './components/create-edit-user-form/create-edit-user-form.component';

@NgModule({
  declarations: [UsersListComponent, CreateEditUserFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    ToastrModule,
    OperatorUiModule,
    TerritoryUiModule,
    MatPaginatorModule,
  ],
  exports: [UsersListComponent, CreateEditUserFormComponent],
})
export class UiUserModule {}
