import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { config } from './config';
import { binding as saveBinding } from './shared/honor/save.schema';
import { binding as statsBinding } from './shared/honor/stats.schema';
import { StatsAction } from './actions/StatsAction';
import { SaveAction } from './actions/SaveAction';
import { HonorRepositoryProvider } from './providers/HonorRepositoryProvider';

@serviceProvider({
  config,
  providers: [HonorRepositoryProvider],
  validator: [saveBinding, statsBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [StatsAction, SaveAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
