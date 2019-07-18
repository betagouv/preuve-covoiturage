import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NotAuthenticatedLayoutComponent} from './components/not-authenticated-layout/not-authenticated-layout.component';
import {AuthenticatedLayoutComponent} from './components/authenticated-layout/authenticated-layout.component';
import {RouterModule} from '@angular/router';
import {HttpApiInterceptor} from './interceptor/http.interceptor';
import {SharedModule} from '../shared/shared.module';
import {ToastrModule} from 'ngx-toastr';

@NgModule({
  declarations: [
    NotAuthenticatedLayoutComponent,
    AuthenticatedLayoutComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ToastrModule.forRoot()
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpApiInterceptor, multi: true}
  ],
})
export class CoreModule {
}
