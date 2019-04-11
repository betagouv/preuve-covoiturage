/* Angular */
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* PrimeNg */
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';


/* Local services */
import { HttpApiInterceptor } from './applicativeService/interceptor/httpApiInterceptor';
import { HeaderBag } from './applicativeService/interceptor/header-bag';
import { Logged } from './applicativeService/authguard/logged';
import { AuthGuard } from './applicativeService/authguard/service';
import { AuthenticationService } from './applicativeService/authentication/service';
import { TokenService } from './applicativeService/token/service';
import { LoggerService } from './applicativeService/logger/service';
import { TranslationService } from './shared/services/translationService';
import { CleanService } from './shared/services/cleanService';
import { TableService } from './shared/services/tableService';
import { DropdownService } from './shared/services/dropdownService';
/* Local component */
import { NotDeletedPipe } from './filters/notDeleted/pipe';
import { IncitationsComponent } from './main/pages/incitations/component';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Layout
import { HeaderComponent } from './shared/layout/components/header/component';
import { MenuComponent } from './shared/layout/components/menu/component';
import { LayoutComponent } from './shared/layout/main/component';

/* Feature modules */
/* Shared modules */
import { FormModule } from './shared/modules/form/form.module';
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

    // pages
    IncitationsComponent,

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

export class AppModule {
}
