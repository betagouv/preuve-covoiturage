import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { binding as createBinding } from './shared/operator/create.schema';
import { binding as updateBinding } from './shared/operator/update.schema';
import { binding as deleteBinding } from './shared/operator/delete.schema';
import { binding as findBinding } from './shared/operator/find.schema';
import { binding as quickfindBinding } from './shared/operator/quickfind.schema';
import { binding as patchContactsBinding } from './shared/operator/patchContacts.schema';

import { config } from './config';
import { OperatorPgRepositoryProvider } from './providers/OperatorPgRepositoryProvider';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { FindOperatorAction } from './actions/FindOperatorAction';
import { QuickFindOperatorAction } from './actions/QuickFindOperatorAction';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction';

@serviceProvider({
  config,
  providers: [OperatorPgRepositoryProvider],
  validator: [createBinding, updateBinding, deleteBinding, findBinding, quickfindBinding, patchContactsBinding],
  handlers: [
    ListOperatorAction,
    CreateOperatorAction,
    UpdateOperatorAction,
    DeleteOperatorAction,
    FindOperatorAction,
    QuickFindOperatorAction,
    PatchContactsOperatorAction,
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
  ],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
