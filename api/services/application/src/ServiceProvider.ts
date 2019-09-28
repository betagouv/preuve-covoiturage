import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { TokenProvider } from '@pdc/provider-token';
import {
  applicationListSchema,
  applicationFindSchema,
  applicationCreateSchema,
  applicationRevokeSchema,
} from '@pdc/provider-schema';

import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { ApplicationRepositoryProvider } from './providers/ApplicationRepositoryProvider';
import { MigrateCommand } from './commands/MigrateCommand';
import {
  ListApplicationAction,
  FindApplicationAction,
  CreateApplicationAction,
  RevokeApplicationAction,
} from './actions';

@serviceProvider({
  config: __dirname,
  providers: [ApplicationRepositoryProvider, TokenProvider],
  validator: [
    ['application.list', applicationListSchema],
    ['application.find', applicationFindSchema],
    ['application.create', applicationCreateSchema],
    ['application.revoke', applicationRevokeSchema],
  ],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware], ['scopeIt', ScopeToSelfMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [ListApplicationAction, FindApplicationAction, CreateApplicationAction, RevokeApplicationAction],
  commands: [MigrateCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
