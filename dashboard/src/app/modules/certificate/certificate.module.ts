import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { SharedModule } from '~/shared/shared.module';

import { GenerateComponent } from './pages/generate/generate.component';
import { CheckComponent } from './pages/check/check.component';
import { CertificateLayoutComponent } from './certificate-layout/certificate-layout.component';
import { CertificateRoutingModule } from './certificate-routing.module';
import { CertificateListComponent } from './pages/certificate-list/certificate-list.component';
import { TerritoryUiModule } from '../territory/modules/territory-ui/territory-ui.module';
import { OperatorUiModule } from '../operator/modules/operator-ui/operator-ui.module';

@NgModule({
  declarations: [GenerateComponent, CheckComponent, CertificateLayoutComponent, CertificateListComponent],
  imports: [
    CommonModule,
    MaterialModule,

    ToastrModule,
    FormsModule,
    TerritoryUiModule,
    OperatorUiModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    SharedModule,
    CertificateRoutingModule,
  ],
})
export class CertificateModule {}
