import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { captureException, init } from '@sentry/browser';
// import {Event} from '@sentry/browser';
@Injectable()
export class SentryErrorHandler extends ErrorHandler {
  trackError: boolean;
  constructor() {
    super();

    if (environment.sentryDSN) {
      this.trackError = true;
      init({ dsn: environment.sentryDSN });
    } else;
    this.trackError = true;
  }

  handleError(error) {
    // Here you can provide whatever logging you want

    captureException(error.originalError || error, {
      extra: error,
      tags: {
        environment: environment.name,
        production_mode: environment.production ? 'yes' : 'no',
      },
    });

    super.handleError(error);
  }
}
