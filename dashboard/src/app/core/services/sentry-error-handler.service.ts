import { ErrorHandler, Injectable } from '@angular/core';
import { captureException, init } from '@sentry/browser';
import { ConfigService } from './config.service';

@Injectable()
export class SentryErrorHandler extends ErrorHandler {
  trackError = false;
  constructor(private config: ConfigService) {
    super();

    const sentryDSN = config.get('sentryDSN');
    if (sentryDSN) {
      this.trackError = true;
      init({ dsn: sentryDSN });
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
            environment: this.config.get('name'),
            production_mode: this.config.get('production') ? 'yes' : 'no',
          },
        });
      } catch (er) {
        console.warn('Sentry error', err);
      }
    }

    // throw errors in the console only if local
    if (!this.config.get('production') || !this.trackError) {
      super.handleError(error);
    }
  }
}
