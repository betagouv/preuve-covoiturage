import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { create } from './shared/acquisition/create.schema';
import { createLegacy } from './shared/acquisition/createLegacy.schema';
import { JourneyPgRepositoryProvider } from './providers/JourneyPgRepositoryProvider';
import { CreateJourneyLegacyAction } from './actions/CreateJourneyLegacyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogAction } from './actions/LogAction';

@serviceProvider({
  config: __dirname,
  queues: ['normalization'],
  providers: [JourneyPgRepositoryProvider],
  validator: [['journey.createLegacy', createLegacy], ['journey.create', create]],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres'], [RedisConnection, 'connections.redis']],
  handlers: [CreateJourneyLegacyAction, CreateJourneyAction, LogAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
