import { serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { MongoConnection } from '@ilos/connection-mongo';

import { ListAction } from './actions/ListAction';
import { MongostatsRepositoryProvider } from './providers/MongoStatsRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [MongostatsRepositoryProvider],
  connections: [[MongoConnection, 'connections.mongo']],
  middlewares: [],
  handlers: [ListAction],
})
export class ServiceProvider extends AbstractServiceProvider {}
