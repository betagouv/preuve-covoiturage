import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware } from '@pdc/provider-validator';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { binding as crosscheckBinding } from './shared/carpool/crosscheck.schema';
import { binding as findBinding } from './shared/carpool/find.schema';
import { config } from './config';
import { CarpoolRepositoryProvider } from './providers/CarpoolRepositoryProvider';
import { CrosscheckAction } from './actions/CrosscheckAction';
import { DispatchAction } from './actions/DispatchAction';
import { FindAction } from './actions/FindAction';
import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider';
import { IdentityRepositoryProvider } from './providers/IdentityRepositoryProvider';
import { UpdateStatusAction } from './actions/UpdateStatusAction';

@serviceProvider({
  config,
  providers: [CarpoolRepositoryProvider, CrosscheckRepositoryProvider, IdentityRepositoryProvider],
  validator: [crosscheckBinding, findBinding],
  middlewares: [
    ['validate', ValidatorMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [CrosscheckAction, DispatchAction, UpdateStatusAction, FindAction],
  queues: ['carpool'],
})
export class ServiceProvider extends AbstractServiceProvider {}
