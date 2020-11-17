import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware, ValidatorExtension } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { config } from './config';
import { binding as crosscheckBinding } from './shared/carpool/crosscheck.schema';
import { binding as findUuidBinding } from './shared/carpool/finduuid.schema';
import { CarpoolRepositoryProvider } from './providers/CarpoolRepositoryProvider';
import { CrosscheckAction } from './actions/CrosscheckAction';
import { DispatchAction } from './actions/DispatchAction';
import { FindUuidAction } from './actions/FindUuidAction';
import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider';
import { IdentityRepositoryProvider } from './providers/IdentityRepositoryProvider';
import { UpdateStatusAction } from './actions/UpdateStatusAction';

@serviceProvider({
  config,
  providers: [CarpoolRepositoryProvider, CrosscheckRepositoryProvider, IdentityRepositoryProvider],
  validator: [crosscheckBinding, findUuidBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CrosscheckAction, DispatchAction, FindUuidAction, UpdateStatusAction],
  queues: ['carpool'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
