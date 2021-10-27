/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ToastrModule } from 'ngx-toastr';
import { ChangePasswordModule } from '~/modules/authentication/modules/change-password/change-password.module';
import { ApplicationUiModule } from '~/modules/operator/modules/application-ui/application-ui.module';
import { OperatorUiModule } from '~/modules/operator/modules/operator-ui/operator-ui.module';
import { OperatorModule } from '~/modules/operator/operator.module';
import { TerritoryUiModule } from '~/modules/territory/modules/territory-ui/territory-ui.module';
import { ProfileUiModule } from '~/modules/user/modules/profile-ui/profile-ui.module';
import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';
import { CertificateModule } from '../certificate/certificate.module';
import { AdministrationLayoutComponent } from './administration-layout/administration-layout.component';
import { AdministrationRoutingModule } from './administration-routing.module';
import { AllOperatorsComponent } from './pages/all-operators/all-operators.component';
import { AllTerritoriesComponent } from './pages/all-territories/all-territories.component';
import { ApiComponent } from './pages/api/api.component';
import { CertificateMetaDialogComponent } from './pages/certificate-list/certificate-meta-dialog/certificate-meta-dialog.component';
import { OperatorComponent } from './pages/operator/operator.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TerritoryComponent } from './pages/territory/territory.component';

@NgModule({
  declarations: [
    AdministrationLayoutComponent,
    AllOperatorsComponent,
    AllTerritoriesComponent,
    ApiComponent,
    CertificateMetaDialogComponent,
    OperatorComponent,
    ProfileComponent,
    TerritoryComponent,
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
    ProfileUiModule,
    ReactiveFormsModule,
    SharedModule,
    TerritoryUiModule,
    ToastrModule,
  ],
})
export class AdministrationModule {}
