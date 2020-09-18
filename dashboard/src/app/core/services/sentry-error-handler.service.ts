import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as Sentry from '@sentry/browser';

@Injectable()
export class SentryErrorHandler extends ErrorHandler {
  trackError: boolean;
  constructor() {
    super();

    if (environment.sentryDSN) {
      this.trackError = true;
      Sentry.init({ dsn: environment.sentryDSN });
    } else;
    this.trackError = true;
  }

  handleError(error) {
    // Here you can provide whatever logging you want

    Sentry.captureException(error, {
      tags: {
        environment: environment.name,
        production_mode: environment.production ? 'yes' : 'no',
      },
    });

    // console.log('--err', error);
    super.handleError(error);
  }
}
