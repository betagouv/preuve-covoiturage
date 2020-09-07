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
      Sentry.init({ dsn, release: `pdc-api@${release}`, environment });
    }
  }
}
