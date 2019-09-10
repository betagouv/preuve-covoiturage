import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  applicationAllSchema as applicationListSchema,
  applicationFindSchema,
  applicationCreateSchema,
  applicationRevokeSchema,
} from '@pdc/provider-schema';

import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { ApplicationRepositoryProvider } from './providers/ApplicationRepositoryProvider';
import {
  ListApplicationAction,
  FindApplicationAction,
  CreateApplicationAction,
  RevokeApplicationAction,
} from './actions';

@serviceProvider({
  config: __dirname,
  providers: [ApplicationRepositoryProvider],
  validator: [
    ['application.list', applicationListSchema],
    ['application.find', applicationFindSchema],
    ['application.create', applicationCreateSchema],
    ['application.revoke', applicationRevokeSchema],
  ],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware], ['scopeIt', ScopeToSelfMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [ListApplicationAction, FindApplicationAction, CreateApplicationAction, RevokeApplicationAction],
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
