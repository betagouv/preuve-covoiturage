import { Parents, Providers } from '@pdc/core';
import { SentryProvider } from '@pdc/provider-sentry';
import { serviceProviders as notificationServiceProviders } from '@pdc/service-notification';

export class Kernel extends Parents.Kernel {
  alias = [
    Providers.EnvProvider,
    Providers.ConfigProvider,
    Providers.CommandProvider,
    SentryProvider,
  ];

  serviceProviders = [
    ...notificationServiceProviders,
  ];
}
