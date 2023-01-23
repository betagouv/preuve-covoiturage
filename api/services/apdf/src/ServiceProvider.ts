import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { APDFNameProvider, S3StorageProvider } from '@pdc/provider-file';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ExportAction } from './actions/ExportAction';
import { config } from './config';
import { ExportCron } from './cron/ExportCron';
import { DataRepositoryProvider } from './providers/APDFRepositoryProvider';

@serviceProvider({
  config,
  providers: [APDFNameProvider, DataRepositoryProvider, S3StorageProvider],
  validator: [
    // ['user.changePassword', changePassword],
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  handlers: [ExportAction, ExportCron],
  commands: [],
  queues: ['apdf'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
