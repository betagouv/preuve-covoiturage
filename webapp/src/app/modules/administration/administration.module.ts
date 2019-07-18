import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdministrationRoutingModule} from './administration-routing.module';
import {AdministrationLayoutComponent} from './administration-layout/administration-layout.component';
import {MaterialModule} from '../../shared/material/material.module';
import {ProfilComponent} from './pages/profil/profil.component';
import {TerritoryComponent} from './pages/territory/territory.component';
import {UsersComponent} from './pages/users/users.component';
import {UiUserModule} from '../user/ui-user/ui-user.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrModule} from 'ngx-toastr';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,
    ProfilComponent,
    TerritoryComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    AdministrationRoutingModule,
    UiUserModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    SharedModule
  ],
})
export class AdministrationModule {
}
