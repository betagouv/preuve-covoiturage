import { Container, Providers, Interfaces } from '@pdc/core';
import { Sentry } from './Sentry';

@Container.provider()
export class SentryProvider implements Interfaces.ProviderInterface {
  constructor(
    protected config: Providers.ConfigProvider,
  ) {}

  boot() {
    const sentryDSN = this.config.get('sentry.dsn');
    const env = this.config.get('sentry.environment');
    const version = this.config.get('sentry.version');

    Sentry.init({
      dsn: sentryDSN,
      release: `pdc-api@${version}`,
      environment: env,
    });    
  }
}
