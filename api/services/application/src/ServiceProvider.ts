import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

// TODO copied from user. Find a better way when refactoring
import { ScopeToSelfMiddleware } from './middlewares/ScopeToSelfMiddleware';

import { ApplicationRepositoryProvider } from './providers/ApplicationRepositoryProvider';

import {
  AllApplicationAction,
  FindApplicationAction,
  CreateApplicationAction,
  RevokeApplicationAction,
} from './actions';

import {
  applicationAllSchema,
  applicationFindSchema,
  applicationCreateSchema,
  applicationRevokeSchema,
} from './schemas';

@serviceProvider({
  config: __dirname,
  providers: [ApplicationRepositoryProvider],
  validator: [
    ['application.all', applicationAllSchema],
    ['application.find', applicationFindSchema],
    ['application.create', applicationCreateSchema],
    ['application.revoke', applicationRevokeSchema],
  ],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware], ['scopeIt', ScopeToSelfMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [AllApplicationAction, FindApplicationAction, CreateApplicationAction, RevokeApplicationAction],
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
