import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { binding as listBinding } from './shared/application/list.schema';
import { binding as findBinding } from './shared/application/find.schema';
import { binding as createBinding } from './shared/application/create.schema';
import { binding as revokeBinding } from './shared/application/revoke.schema';
import { MigrateCommand } from './commands/MigrateCommand';
import { ListApplicationAction } from './actions/ListApplicationAction';
import { FindApplicationAction } from './actions/FindApplicationAction';
import { CreateApplicationAction } from './actions/CreateApplicationAction';
import { RevokeApplicationAction } from './actions/RevokeApplicationAction';
import { ApplicationPgRepositoryProvider } from './providers/ApplicationPgRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [ApplicationPgRepositoryProvider],
  validator: [listBinding, findBinding, createBinding, revokeBinding],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware], ['scopeIt', ScopeToSelfMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [ListApplicationAction, FindApplicationAction, CreateApplicationAction, RevokeApplicationAction],
  commands: [MigrateCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
