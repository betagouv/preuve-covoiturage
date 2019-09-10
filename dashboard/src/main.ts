import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import * as moment from 'moment';

import { AppModule } from '~/app.module';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

moment.locale('fr');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
