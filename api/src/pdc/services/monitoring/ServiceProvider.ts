import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { defaultNotificationBindings } from '@pdc/providers/notification';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { StatsRefreshAction } from './actions/StatsRefreshAction';
import { StatsRefreshCommand } from './commands/StatsRefreshCommand';
import { config } from './config';
import { binding as statsRefreshBinding } from '@shared/monitoring/statsrefresh.schema';

@serviceProvider({
  config,
  providers: [...defaultNotificationBindings],
  commands: [StatsRefreshCommand],
  validator: [statsRefreshBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [StatsRefreshAction],
  queues: ['monitoring'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
