import 'hammerjs';
import * as moment from 'moment';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Sentry } from '@sentry/angular';

import { AppModule } from '~/app.module';

import { environment } from './environments/environment';

Sentry.init({ dsn: 'https://57ba75d39edb43139f837ee75b877d06@sentry.data.gouv.fr/27' });

if (environment.production) {
  enableProdMode();
}

moment.locale('fr');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
