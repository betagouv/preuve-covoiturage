import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileUiModule } from '~/modules/profile/modules/profile-ui/profile-ui.module';
import { MaterialModule } from '~/shared/material/material.module';

import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  declarations: [AdministrationLayoutComponent, ProfileComponent, TerritoryComponent, UsersComponent],
  imports: [AdministrationRoutingModule, CommonModule, MaterialModule, ProfileUiModule],
})
export class AdministrationModule {}
