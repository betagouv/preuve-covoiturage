/* Angular */
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/* PrimeNg */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';

/* Local services */
import { HttpApiInterceptor } from './applicativeService/interceptor/httpApiInterceptor';
import { HeaderBag } from './applicativeService/interceptor/header-bag';
import { Logged } from './applicativeService/authguard/logged';
import { AuthGuard } from './applicativeService/authguard/service';
import { AuthenticationService } from './applicativeService/authentication/service';
import { TokenService } from './applicativeService/token/service';
import { LoggerService } from './applicativeService/logger/service';
import { TranslationService } from './services/translationService';
import { CleanService } from './services/cleanService';
import { TableService } from './services/tableService';
import { DropdownService } from './services/dropdownService';
/* Local component */
import { NotDeletedPipe } from './filters/notDeleted/pipe';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Layout
import { LayoutComponent } from './layout/main/component';
import { HeaderComponent } from './layout/components/header/component';
import { MenuComponent } from './layout/components/menu/component';
/* Feature modules */
import { OperatorModule } from './modules/operator/operator.module';
import { UserModule } from './modules/user/user.module';
import { AomModule } from './modules/aom/aom.module';
import { JourneyModule } from './modules/journeys/journey.module';
import { AuthModule } from './modules/auth/auth.module';
import { HomeModule } from './modules/home/home.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { RegistryModule } from './modules/registry/registry.module';
import { IncentiveModule } from './modules/incentive/incentive.module';
/* Shared modules */
import { FormModule } from './shared/form/form.module';
import { GraphicModule } from './shared/graphic/graphic.module';

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
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,

    // Feature module
    AuthModule,
    OperatorModule,
    UserModule,
    AomModule,
    JourneyModule,
    HomeModule,
    StatisticsModule,
    RegistryModule,
    IncentiveModule,

    // Common module
    FormModule,
    GraphicModule,

    // PrimeNg
    TableModule,
    MultiSelectModule,
    SliderModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    MenuModule,
    TieredMenuModule,
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
    CleanService,

    //  crud
    TokenService,

    // data
    TranslationService,
    TableService,
    DropdownService,

    /* Prime ng*/
    MessageService,
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}
