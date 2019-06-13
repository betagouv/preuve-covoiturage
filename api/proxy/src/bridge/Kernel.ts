import { Parents, Types, Interfaces } from '@ilos/core';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { EnvProvider, EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { CommandProvider } from '@ilos/cli';
import { SentryProvider } from '@pdc/provider-sentry';
import { serviceProviders as notificationServiceProviders } from '@pdc/service-notification';

export class Kernel extends Parents.Kernel {
  alias = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
    CommandProvider,
    SentryProvider,
  ];

  serviceProviders: Types.NewableType<Interfaces.ServiceProviderInterface>[] = [...notificationServiceProviders];
}
