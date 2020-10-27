import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { captureException, init } from '@sentry/browser';

@Injectable()
export class SentryErrorHandler extends ErrorHandler {
  trackError = false;
  constructor() {
    super();

    if (environment.sentryDSN) {
      this.trackError = true;
      init({ dsn: environment.sentryDSN });
    }

    this.trackError = true;
  }

  handleError(error) {
    if (this.trackError) {
      let err = error;
      const extra: any = {};

      switch (true) {
        case error.originalError !== undefined:
          err = error.originalError;
          break;
        case error.status !== undefined:
          err = new Error('API error');
          extra.http = JSON.stringify(error);
          break;
      }

      try {
        captureException(err, {
          extra,
          tags: {
            environment: environment.name,
            production_mode: environment.production ? 'yes' : 'no',
          },
        });
      } catch (er) {
        console.warn('Sentry error', err);
      }
    }

    // throw errors in the console only if local
    if (!environment.production || !this.trackError) {
      super.handleError(error);
    }
  }
}
