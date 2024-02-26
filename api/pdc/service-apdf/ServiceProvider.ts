import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { APDFNameProvider, S3StorageProvider } from '@pdc/provider-storage';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { DataRepositoryProvider } from './providers/APDFRepositoryProvider';
import { StorageRepositoryProvider } from './providers/StorageRepositoryProvider';
import { binding as exportBinding } from '@shared/apdf/export.schema';
import { binding as listBinding } from '@shared/apdf/list.schema';

import { ExportAction } from './actions/ExportAction';
import { ListAction } from './actions/ListAction';
import { ExportCommand } from './commands/ExportCommand';

@serviceProvider({
  config,
  queues: ['apdf'],
  validator: [listBinding, exportBinding],
  providers: [APDFNameProvider, DataRepositoryProvider, S3StorageProvider, StorageRepositoryProvider],
  handlers: [ListAction, ExportAction],
  commands: [ExportCommand],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
