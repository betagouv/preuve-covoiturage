import { Container, Providers } from '@pdc/core';
import { Sentry } from './Sentry';

Container.provider()
export class SentryProvider {
  constructor(
    protected config: Providers.ConfigProvider,
    protected env: Providers.EnvProvider,
  ) {}

  boot() {
    const sentryDSN = this.config.get('sentry.dsn');
    const env = this.env.get('SENTRY_ENV', this.env.get('APP_ENV'));
    const version = '0.0.1';

    Sentry.init({
      dsn: sentryDSN,
      release: `pdc-api@${version}`,
      environment: env,
    });    
  }
}
