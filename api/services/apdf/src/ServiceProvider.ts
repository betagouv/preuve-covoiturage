import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ExportAction } from './actions/ExportAction';
import { config } from './config';
import { ExportCron } from './cron/ExportCron';
import { APDFRepositoryProvider } from './providers/APDFRepositoryProvider';

@serviceProvider({
  config,
  providers: [APDFRepositoryProvider],
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
