import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { create } from './shared/acquisition/create.schema';
import { createLegacy } from './shared/acquisition/createLegacy.schema';
import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { CreateJourneyLegacyAction } from './actions/CreateJourneyLegacyAction';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { LogAction } from './actions/LogAction';

@serviceProvider({
  config: __dirname,
  queues: ['normalization'],
  providers: [JourneyRepositoryProvider],
  validator: [['journey.createLegacy', createLegacy], ['journey.create', create]],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
  connections: [[MongoConnection, 'connections.mongo'], [RedisConnection, 'connections.redis']],
  handlers: [CreateJourneyLegacyAction, CreateJourneyAction, LogAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
