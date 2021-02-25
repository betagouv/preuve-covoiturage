import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';

import { CompanyModule } from '~/modules/company/company.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LogoutComponent } from './modules/logout/logout.component';

registerLocaleData(fr);

@NgModule({
  declarations: [AppComponent, LogoutComponent],
  imports: [CoreModule, AppRoutingModule, CompanyModule],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
