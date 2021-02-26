import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { PostgresConnection } from '@ilos/connection-postgres';

import { config } from './config';
import { binding as listBinding } from './shared/application/list.schema';
import { binding as findBinding } from './shared/application/find.schema';
import { binding as createBinding } from './shared/application/create.schema';
import { binding as revokeBinding } from './shared/application/revoke.schema';
import { ListApplicationAction } from './actions/ListApplicationAction';
import { FindApplicationAction } from './actions/FindApplicationAction';
import { CreateApplicationAction } from './actions/CreateApplicationAction';
import { RevokeApplicationAction } from './actions/RevokeApplicationAction';
import { ApplicationPgRepositoryProvider } from './providers/ApplicationPgRepositoryProvider';

@serviceProvider({
  config,
  providers: [ApplicationPgRepositoryProvider],
  validator: [listBinding, findBinding, createBinding, revokeBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [ListApplicationAction, FindApplicationAction, CreateApplicationAction, RevokeApplicationAction],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
