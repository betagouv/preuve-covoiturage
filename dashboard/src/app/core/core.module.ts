import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { SharedModule } from '~/shared/shared.module';
import { AuthGuard } from '~/core/guards/auth-guard.service';
import { ConfirmDialogComponent } from '~/core/components/dialog/confirm-dialog.component';
import { MaterialModule } from '~/shared/modules/material/material.module';

// eslint-disable-next-line
import { NotAuthenticatedLayoutComponent } from './components/not-authenticated-layout/not-authenticated-layout.component';
import { AuthenticatedLayoutComponent } from './components/authenticated-layout/authenticated-layout.component';
import { HttpApiInterceptor } from './interceptor/http.interceptor';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ServiceUnavailableComponent } from './components/service-unavailable/service-unavailable.component';

@NgModule({
  declarations: [
    AuthenticatedLayoutComponent,
    NotAuthenticatedLayoutComponent,
    ConfirmDialogComponent,
    NotFoundComponent,
    ServiceUnavailableComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    MaterialModule,
    ToastrModule.forRoot(),
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpApiInterceptor, multi: true }, AuthGuard],
  entryComponents: [ConfirmDialogComponent],
})
export class CoreModule {}
