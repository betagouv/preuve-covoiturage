/* eslint-disable max-len */
import { ToastrModule } from 'ngx-toastr';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

import { AllUsersComponent } from '~/modules/administration/pages/all-users/all-users.component';
import { ApplicationUiModule } from '~/modules/operator/modules/application-ui/application-ui.module';
import { ChangePasswordModule } from '~/modules/authentication/modules/change-password/change-password.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { OperatorModule } from '~/modules/operator/operator.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { OperatorVisibilityModule } from '~/modules/operator/modules/operator-visibility/operator-visibility.module';
import { ProfileUiModule } from '~/modules/user/modules/profile-ui/profile-ui.module';
import { SharedModule } from '~/shared/shared.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { UiUserModule } from '~/modules/user/modules/ui-user/ui-user.module';

import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { AllOperatorsComponent } from './pages/all-operators/all-operators.component';
import { AllTerritoriesComponent } from './pages/all-territories/all-territories.component';
import { ApiComponent } from './pages/api/api.component';
import { CertificateMetaDialogComponent } from './pages/certificate-list/certificate-meta-dialog/certificate-meta-dialog.component';
import { CertificateModule } from '../certificate/certificate.module';
import { OperatorComponent } from './pages/operator/operator.component';
import { OperatorVisibilityComponent } from './pages/operator-visibility/operator-visibility.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,
    AllOperatorsComponent,
    AllTerritoriesComponent,
    AllUsersComponent,
    ApiComponent,
    CertificateMetaDialogComponent,
    OperatorComponent,
    OperatorVisibilityComponent,
    ProfileComponent,
    TerritoryComponent,
    UsersComponent,
  ],
  imports: [
    AdministrationRoutingModule,
    ApplicationUiModule,
    CertificateModule,
    ChangePasswordModule,
    CommonModule,
    FormsModule,
    MaterialModule,
    MatPaginatorModule,
    OperatorModule,
    OperatorUiModule,
    OperatorVisibilityModule,
    ProfileUiModule,
    ReactiveFormsModule,
    SharedModule,
    TerritoryUiModule,
    ToastrModule,
    UiUserModule,
  ],
})
export class AdministrationModule {}
