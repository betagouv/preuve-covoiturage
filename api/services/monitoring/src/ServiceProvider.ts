import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { JourneysStatsAction } from './actions/JourneysStatsAction';
import { JourneysStatsCommand } from './commands/JourneysStatsCommand';
import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { binding as statsBinding } from './shared/monitoring/journeys/stats.schema';

@serviceProvider({
  config,
  providers: [JourneyRepositoryProvider],
  commands: [JourneysStatsCommand],
  validator: [statsBinding],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [JourneysStatsAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
