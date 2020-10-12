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
        // extra: { json_error: JSON.stringify(error) },
        extra,
        tags: {
          environment: environment.name,
          production_mode: environment.production ? 'yes' : 'no',
        },
      });
    } catch (er) {
      console.warn('Sentry error', err);
    }

    // throw errors in the console only if local
    if (!environment.production) {
      super.handleError(error);
    }
  }
}
