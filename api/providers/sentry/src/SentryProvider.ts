import { Container, Interfaces } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';

import { Sentry } from './Sentry';

@Container.provider()
export class SentryProvider implements Interfaces.ProviderInterface {
  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const sentryDSN = this.config.get('sentry.dsn', null);
    const env = this.config.get('sentry.environment', null);
    const version = this.config.get('sentry.version', null);

    if (sentryDSN && env && version) {
      Sentry.init({
        dsn: sentryDSN,
        release: `pdc-api@${version}`,
        environment: env,
      });
    }
  }
}
