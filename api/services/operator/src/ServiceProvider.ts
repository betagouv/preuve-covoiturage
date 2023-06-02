import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { OperatorPgRepositoryProvider } from './providers/OperatorPgRepositoryProvider';

import { binding as createBinding } from './shared/operator/create.schema';
import { binding as deleteBinding } from './shared/operator/delete.schema';
import { binding as findBinding } from './shared/operator/find.schema';
import { binding as findbysiretBinding } from './shared/operator/findbysiret.schema';
import { binding as patchContactsBinding } from './shared/operator/patchContacts.schema';
import { binding as patchThumbnailBinding } from './shared/operator/patchThumbnail.schema';
import { binding as quickfindBinding } from './shared/operator/quickfind.schema';
import { binding as updateBinding } from './shared/operator/update.schema';

import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { FindBySiretOperatorAction } from './actions/FindBySiretOperatorAction';
import { FindOperatorAction } from './actions/FindOperatorAction';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction';
import { PatchThumbnailOperatorAction } from './actions/PatchThumbnailOperatorAction';
import { QuickFindOperatorAction } from './actions/QuickFindOperatorAction';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction';

@serviceProvider({
  config,
  providers: [OperatorPgRepositoryProvider],
  validator: [
    createBinding,
    deleteBinding,
    findBinding,
    findbysiretBinding,
    patchContactsBinding,
    patchThumbnailBinding,
    quickfindBinding,
    updateBinding,
  ],
  handlers: [
    CreateOperatorAction,
    DeleteOperatorAction,
    FindBySiretOperatorAction,
    FindOperatorAction,
    ListOperatorAction,
    PatchContactsOperatorAction,
    PatchThumbnailOperatorAction,
    QuickFindOperatorAction,
    UpdateOperatorAction,
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
