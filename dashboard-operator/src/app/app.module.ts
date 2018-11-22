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
import {HttpApiInterceptor} from './applicativeService/interceptor/httpApiInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {HeaderBag} from "./applicativeService/interceptor/header-bag";
import {MessageComponent} from "./applicativeService/message/component";
import {OperatorService} from "./services/operatorService";
import { FileSaverModule } from 'ngx-filesaver';



library.add(fas);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    MessageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    LoadersCssModule,
    HttpClientModule,
    FontAwesomeModule,
    FileSaverModule
  ],
  exports: [
    HeaderComponent,
    MessageComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpApiInterceptor,
      multi: true,
    },
    HeaderBag,
    AuthGuard,
    Logged,
    LoggerService,
    TokenService,
    PingService,
    AuthenticationService,
    HttpClient,
    OperatorService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
