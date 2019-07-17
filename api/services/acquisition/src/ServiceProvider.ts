import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { journeyCreateSchema } from '@pdc/provider-schema';

import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { CreateJourneyAction } from './actions/CreateJourneyAction';

@serviceProvider({
  config: __dirname,
  providers: [JourneyRepositoryProvider],
  validator: [['journey.create', journeyCreateSchema]],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [CreateJourneyAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
