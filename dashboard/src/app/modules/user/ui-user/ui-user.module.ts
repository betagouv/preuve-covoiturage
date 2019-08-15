import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/material/material.module';

import { UsersListComponent } from './components/users-list/users-list.component';
import { CreateEditUserFormComponent } from './components/create-edit-user-form/create-edit-user-form.component';

@NgModule({
  declarations: [UsersListComponent, CreateEditUserFormComponent],
  imports: [CommonModule, SharedModule, FormsModule, MaterialModule, ReactiveFormsModule, ToastrModule],
  exports: [UsersListComponent, CreateEditUserFormComponent],
})
export class UiUserModule {}
