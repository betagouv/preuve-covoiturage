import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material';

import { ProfileUiModule } from '~/modules/user/modules/profile-ui/profile-ui.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { ChangePasswordModule } from '~/modules/authentication/modules/change-password/change-password.module';
import { UiUserModule } from '~/modules/user/modules/ui-user/ui-user.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { SharedModule } from '~/shared/shared.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { OperatorModule } from '~/modules/operator/operator.module';
import { ApplicationUiModule } from '~/modules/operator/modules/application-ui/application-ui.module';
import { AllUsersComponent } from '~/modules/administration/pages/all-users/all-users.component';
import { OperatorVisibilityModule } from '~/modules/operator/modules/operator-visibility/operator-visibility.module';

import { AdministrationRoutingModule } from './administration-routing.module';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';
import { UsersComponent } from './pages/users/users.component';
import { OperatorComponent } from './pages/operator/operator.component';
import { ApiComponent } from './pages/api/api.component';
import { AllTerritoriesComponent } from './pages/all-territories/all-territories.component';
import { AllOperatorsComponent } from './pages/all-operators/all-operators.component';
import { OperatorVisibilityComponent } from './pages/operator-visibility/operator-visibility.component';
import { CertificateModule } from '../certificate/certificate.module';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,
    OperatorComponent,
    ProfileComponent,
    TerritoryComponent,
    UsersComponent,
    ApiComponent,
    AllUsersComponent,
    AllTerritoriesComponent,
    AllOperatorsComponent,
    OperatorVisibilityComponent,
  ],
  imports: [
    AdministrationRoutingModule,
    ChangePasswordModule,
    CommonModule,
    MaterialModule,
    ProfileUiModule,
    UiUserModule,
    ToastrModule,
    TerritoryUiModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OperatorUiModule,
    OperatorModule,
    CertificateModule,
    ApplicationUiModule,
    MatPaginatorModule,
    OperatorVisibilityModule,
  ],
})
export class AdministrationModule {}
