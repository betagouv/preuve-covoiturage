import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { binding as createBinding } from './shared/operator/create.schema';
import { binding as updateBinding } from './shared/operator/update.schema';
import { binding as deleteBinding } from './shared/operator/delete.schema';
import { binding as findBinding } from './shared/operator/find.schema';
import { binding as patchContactsBinding } from './shared/operator/patchContacts.schema';

import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { FindOperatorAction } from './actions/FindOperatorAction';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction';
import { MigrateCommand } from './commands/MigrateCommand';

@serviceProvider({
  config: __dirname,
  providers: [OperatorRepositoryProvider],
  validator: [createBinding, updateBinding, deleteBinding, findBinding, patchContactsBinding],
  handlers: [
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
