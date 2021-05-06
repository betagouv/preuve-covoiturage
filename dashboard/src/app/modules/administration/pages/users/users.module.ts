import { ToastrModule } from 'ngx-toastr';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';
import { CreateComponent } from './create/create.component';
import { UsersRoutingModule } from './users-routing.module';

@NgModule({
  declarations: [ListComponent, CreateComponent, EditComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    SharedModule,
    ToastrModule,
    UsersRoutingModule,
  ],
})
export class UsersModule {}
