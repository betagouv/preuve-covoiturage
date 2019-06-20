import { Parents } from '@ilos/core';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { EnvProvider, EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { CommandProvider } from '@ilos/cli';
import { SentryProvider } from '@pdc/provider-sentry';

export class Kernel extends Parents.Kernel {
  alias = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
    CommandProvider,
    SentryProvider,
  ];
}
