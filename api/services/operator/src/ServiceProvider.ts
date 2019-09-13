import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { operatorCreateSchema, operatorPatchSchema, operatorDeleteSchema } from '@pdc/provider-schema';

import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { PatchOperatorAction } from './actions/PatchOperatorAction';
import { SchemaOperatorAction } from './actions/SchemaOperatorAction';

@serviceProvider({
  config: __dirname,
  providers: [OperatorRepositoryProvider],
  validator: [
    ['operator.create', operatorCreateSchema],
    ['operator.patch', operatorPatchSchema],
    ['operator.delete', operatorDeleteSchema],
  ],
  handlers: [SchemaOperatorAction, ListOperatorAction, CreateOperatorAction, PatchOperatorAction, DeleteOperatorAction],
  connections: [[MongoConnection, 'mongo']],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
