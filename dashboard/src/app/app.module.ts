/* Angular */
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
/* PrimeNg */
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

/* Local services */
import { HttpApiInterceptor } from './applicativeService/interceptor/httpApiInterceptor';
import { HeaderBag } from './applicativeService/interceptor/header-bag';
import { Logged } from './applicativeService/authentication/logged';
import { AuthGuard } from './guards/auth-guard.service';
import { AuthenticationService } from './applicativeService/authentication/auth.service';
import { LoggerService } from './applicativeService/logger/logger.service';
/* Local component */
import { NotDeletedPipe } from './filters/notDeleted/pipe';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Layout
import { HeaderComponent } from './shared/layout/components/header/component';
import { MenuComponent } from './shared/layout/components/menu/component';
import { LayoutComponent } from './shared/layout/main/component';
/* Feature modules */
/* Shared modules */
import { GraphicModule } from './shared/modules/graphic/graphic.module';

/* Libs */

@NgModule({
  declarations: [
    // main
    AppComponent,

    // Layout Component
    LayoutComponent,
    HeaderComponent,
    MenuComponent,

    // pipes
    NotDeletedPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // useful for primeng
    AppRoutingModule,
    HttpClientModule,

    // Common module
    GraphicModule,

    // PrimeNg
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    MenuModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpApiInterceptor,
      multi: true,
    },
    HttpClient,
    AuthenticationService,
    HeaderBag,
    AuthGuard,
    Logged,

    // tools
    LoggerService,

    /* Prime ng*/
    MessageService,
    ConfirmationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
