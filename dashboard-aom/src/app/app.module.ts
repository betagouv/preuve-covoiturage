import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {LoginComponent} from './components/login/component';
import {LoggerService} from './applicativeService/logger/service';
import {Logged} from './applicativeService/authguard/logged';
import {HomeComponent} from './components/home/component';
import {HeaderComponent} from './components/header/component';
import { LoadersCssModule } from 'angular2-loaders-css';
import { FormsModule } from '@angular/forms';
import {AuthGuard} from './applicativeService/authguard/service';
import {TokenService} from './applicativeService/token/service';
import {PingService} from './applicativeService/ping/service';
import {AuthenticationService} from './applicativeService/authentication/service';
import {
  HTTP_INTERCEPTORS, HttpClient, HttpClientModule
} from '@angular/common/http';
import {HttpErrorInterceptor} from './applicativeService/interceptor/HttpErrorInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
// import { far } from '@fortawesome/free-regular-svg-icons';


library.add(fas);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    LoadersCssModule,
    HttpClientModule,
    FontAwesomeModule,
  ],
  exports: [
    HeaderComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    AuthGuard,
    Logged,
    LoggerService,
    TokenService,
    PingService,
    AuthenticationService,
    HttpClient
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
