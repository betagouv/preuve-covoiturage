import * as moment from 'moment';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '~/app.module';

import { environment as env } from './environments/environment';

const globalEnv = (window as any).environment;

if ((globalEnv && globalEnv.production) || (!globalEnv && env.production)) {
  enableProdMode();
}

moment.locale('fr');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
