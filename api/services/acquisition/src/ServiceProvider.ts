import { Parents, Interfaces, Extensions, Container } from '@ilos/core';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { JourneyRepositoryProvider } from './providers/JourneyRepositoryProvider';
import { CreateJourneyAction } from './actions/CreateJourneyAction';
import { journeyCreateSchema } from './schemas/journeyCreateSchema';

@Container.serviceProvider({
  config: __dirname,
  providers: [
    JourneyRepositoryProvider,
  ],
  validator: [
    ['journey.create', journeyCreateSchema]
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ],
  connections: [
    [MongoConnection, 'mongo'],
  ],
  handlers: [CreateJourneyAction],
})
export class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
