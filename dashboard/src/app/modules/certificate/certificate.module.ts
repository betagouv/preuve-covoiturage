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

@NgModule({
  declarations: [GenerateComponent, CheckComponent, CertificateLayoutComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ToastrModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    SharedModule,
    CertificateRoutingModule,
  ],
})
export class CertificateModule {}
