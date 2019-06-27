import { Parents, Types, Interfaces } from '@ilos/core';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { EnvProvider, EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { CommandProvider } from '@ilos/cli';
import { SentryProvider } from '@pdc/provider-sentry';

import { serviceProviders as userServiceProviders } from '@pdc/service-user';

export class Kernel extends Parents.Kernel {
  alias = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
    CommandProvider,
    SentryProvider,
  ];

  readonly serviceProviders: Types.NewableType<Interfaces.ServiceProviderInterface>[] = [
    ...userServiceProviders,
  ];
}
