import { Parents } from '@ilos/core';
import { ConfigProvider, ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { EnvProvider, EnvProviderInterfaceResolver } from '@ilos/provider-env';
import { CommandProvider } from '@ilos/cli';
import { SentryProvider } from '@pdc/provider-sentry';
import { NotificationProvider, NotificationProviderInterfaceResolver } from '@ilos/provider-notification';

export class Kernel extends Parents.Kernel {
  alias = [
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
    [NotificationProviderInterfaceResolver, NotificationProvider],
    CommandProvider,
    SentryProvider,
  ];
}
