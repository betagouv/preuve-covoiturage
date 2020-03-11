import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import * as moment from 'moment';

import { AppModule } from '~/app.module';

import { environment } from './environments/environment';

function getInternetExplorerVersion(): number {
  let rv = -1;
  if (navigator.appName == 'Microsoft Internet Explorer') {
    const ua = navigator.userAgent;
    const re = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
  } else if (navigator.appName == 'Netscape') {
    const ua = navigator.userAgent;
    const re = new RegExp('Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})');
    if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
  }
  return rv;
}

// IE 11 and less detection
const ieVersion = getInternetExplorerVersion();

if (ieVersion === -1 || ieVersion > 11) {
  if (environment.production) {
    enableProdMode();
  }

  moment.locale('fr');

  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
} else {
  document.getElementById('ie-warning').classList.remove('hidden');
  document.getElementsByClassName('splashscreen')[0].classList.add('hidden');
}
