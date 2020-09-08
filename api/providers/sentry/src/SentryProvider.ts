import { get } from 'lodash';
import { provider, ProviderInterface, ConfigInterfaceResolver } from '@ilos/common';

import { Sentry } from './Sentry';

@provider()
export class SentryProvider implements ProviderInterface {
  constructor(protected config: ConfigInterfaceResolver) {}

  boot(): void {
    const dsn = this.config.get('sentry.dsn', null);
    const environment = this.config.get('sentry.environment', null);
    const release = this.config.get('sentry.version', null);

    if (dsn && environment && release) {
      Sentry.init({
        dsn,
        release: `pdc-api@${release}`,
        environment,
        beforeSend(event, hint) {
          // add method name to event subtitle
          if (event.transaction === 'POST|/rpc') {
            const data = JSON.parse(get(event, 'request.data', '[]'));
            if (Array.isArray(data)) event.transaction = `POST|/rpc ${get(data[0], 'method', '')}`.trim();
          }

          // filter out 401 errors
          if (hint.originalException.toString().indexOf('Unauthorized') > -1) return null;

          return event;
        },
      });
    }
  }
}
