import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
// import { PermissionMiddleware } from '@ilos/package-acl';
import { NoopMiddleware as PermissionMiddleware } from '@pdc/provider-middleware';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { operatorCreateSchema, operatorPatchSchema, operatorDeleteSchema } from '@pdc/provider-schema';

import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';
import { AllOperatorAction } from './actions/AllOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { PatchOperatorAction } from './actions/PatchOperatorAction';

@serviceProvider({
  config: __dirname,
  providers: [OperatorRepositoryProvider],
  validator: [
    ['operator.create', operatorCreateSchema],
    ['operator.patch', operatorPatchSchema],
    ['operator.delete', operatorDeleteSchema],
  ],
  handlers: [AllOperatorAction, CreateOperatorAction, PatchOperatorAction, DeleteOperatorAction],
  connections: [[MongoConnection, 'mongo']],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
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
