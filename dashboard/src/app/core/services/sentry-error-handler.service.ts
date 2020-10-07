import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { captureException, init } from '@sentry/browser';

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
    // console.warn('handleError', error);

    try {
      captureException(error.originalError || new Error(error.message), {
        extra: error,
        tags: {
          environment: environment.name,
          production_mode: environment.production ? 'yes' : 'no',
        },
      });
    } catch (err) {
      console.warn('capture exception failed for ', error);
    }

    // throw errors in the console only if local
    if (!environment.production) {
      super.handleError(error);
    }
  }
}
