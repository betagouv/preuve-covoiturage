import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
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
  // FIXME: Migrations fail due to required TokenProvider but adding it here
  //        makes the whole stack fail:
  //        - if TokenProvider is loaded and config/jwt.ts exists, the `jwt` key is duplicated --> Error
  //        - if TokenProvider is loaded without config/jwt.ts --> Error, jwt is needed
  //        - No TokenProvider loaded --> OK running the App (it gets it from proxy Kernel), but migration fails
  //          as the proxy Kernel doesn't exist.
  // providers: [ApplicationRepositoryProvider, TokenProvider],
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
  commands: [MigrateCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
