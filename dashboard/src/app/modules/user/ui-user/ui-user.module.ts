import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UsersListComponent} from './users-list/users-list.component';
import {SharedModule} from '../../../shared/shared.module';
import { CreateEditUserFormComponent } from './create-edit-user-form/create-edit-user-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../../shared/material/material.module';
import {ToastrModule} from 'ngx-toastr';

@NgModule({
  declarations: [
    UsersListComponent,
    CreateEditUserFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    ToastrModule
  ],
  exports: [
    UsersListComponent,
    CreateEditUserFormComponent
  ]
})
export class UiUserModule {
}
