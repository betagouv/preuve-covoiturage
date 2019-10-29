import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  operatorCreateSchema,
  operatorUpdateSchema,
  operatorDeleteSchema,
  operatorFindSchema,
  operatorPatchContactsSchema,
} from '@pdc/provider-schema';
import { ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { SchemaOperatorAction } from './actions/SchemaOperatorAction';
import { FindOperatorAction } from './actions/FindOperatorAction';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction';
import { MigrateCommand } from './commands/MigrateCommand';

@serviceProvider({
  config: __dirname,
  providers: [OperatorRepositoryProvider],
  validator: [
    ['operator.create', operatorCreateSchema],
    ['operator.update', operatorUpdateSchema],
    ['operator.delete', operatorDeleteSchema],
    ['operator.find', operatorFindSchema],
    ['operator.patchContacts', operatorPatchContactsSchema],
  ],
  handlers: [
    SchemaOperatorAction,
    ListOperatorAction,
    CreateOperatorAction,
    UpdateOperatorAction,
    DeleteOperatorAction,
    FindOperatorAction,
    PatchContactsOperatorAction,
  ],
  connections: [[MongoConnection, 'mongo']],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
  ],
  commands: [MigrateCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
