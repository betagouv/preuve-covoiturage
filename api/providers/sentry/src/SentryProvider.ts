import { provider, ProviderInterface, ConfigInterfaceResolver } from '@ilos/common';

import { Sentry } from './Sentry';

@provider()
export class SentryProvider implements ProviderInterface {
  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const dsn = this.config.get('sentry.dsn', null);
    const env = this.config.get('sentry.environment', null);
    const version = this.config.get('sentry.version', null);

    if (dsn && env && version) {
      Sentry.init({
        dsn,
        release: `pdc-api@${version}`,
        environment: env,
      });
    }
  }
}
