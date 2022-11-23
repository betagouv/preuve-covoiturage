import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { binding as importCeeBinding } from './shared/cee/importApplication.schema';
import { binding as registerCeeBinding } from './shared/cee/registerApplication.schema';
import { binding as simulateCeeBinding } from './shared/cee/simulateApplication.schema';


import { CeeRepositoryProvider } from './providers/CeeRepositoryProvider';
import { ImportCeeAction } from './actions/ImportCeeAction';
import { RegisterCeeAction } from './actions/RegisterCeeAction';
import { SimulateCeeAction } from './actions/SimulateCeeAction';

@serviceProvider({
  config,
  providers: [
    CeeRepositoryProvider,
  ],
  validator: [
    importCeeBinding,
    registerCeeBinding,
    simulateCeeBinding,
  ],
  handlers: [
    ImportCeeAction,
    RegisterCeeAction,
    SimulateCeeAction,
  ],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
