import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProfileUiModule } from '~/modules/profile/modules/profile-ui/profile-ui.module';
import { MaterialModule } from '~/shared/material/material.module';
import { ChangePasswordModule } from '~/modules/authentication/modules/change-password/change-password.module';
import { UiUserModule } from '~/modules/user/ui-user/ui-user.module';

import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,
    ProfileComponent,
    TerritoryComponent,
    UsersComponent,
  ],
  imports: [
    AdministrationRoutingModule,
    ChangePasswordModule,
    CommonModule,
    MaterialModule,
    ProfileUiModule,
    UiUserModule,
    ToastrModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AdministrationModule {
}
