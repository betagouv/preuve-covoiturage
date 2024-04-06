import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { binding as createBinding } from '@shared/operator/create.schema';
import { binding as deleteBinding } from '@shared/operator/delete.schema';
import { binding as findBinding } from '@shared/operator/find.schema';
import { binding as findbyuuidBinding } from '@shared/operator/findbyuuid.schema';
import { binding as patchContactsBinding } from '@shared/operator/patchContacts.schema';
import { binding as patchThumbnailBinding } from '@shared/operator/patchThumbnail.schema';
import { binding as quickfindBinding } from '@shared/operator/quickfind.schema';
import { binding as updateBinding } from '@shared/operator/update.schema';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { FindByUuidOperatorAction } from './actions/FindByUuidOperatorAction';
import { FindOperatorAction } from './actions/FindOperatorAction';
import { ListOperatorAction } from './actions/ListOperatorAction';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction';
import { PatchThumbnailOperatorAction } from './actions/PatchThumbnailOperatorAction';
import { QuickFindOperatorAction } from './actions/QuickFindOperatorAction';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction';
import { config } from './config';
import { OperatorPgRepositoryProvider } from './providers/OperatorPgRepositoryProvider';

@serviceProvider({
  config,
  providers: [OperatorPgRepositoryProvider],
  validator: [
    createBinding,
    deleteBinding,
    findBinding,
    findbyuuidBinding,
    patchContactsBinding,
    patchThumbnailBinding,
    quickfindBinding,
    updateBinding,
  ],
  handlers: [
    CreateOperatorAction,
    DeleteOperatorAction,
    FindByUuidOperatorAction,
    FindOperatorAction,
    ListOperatorAction,
    PatchContactsOperatorAction,
    PatchThumbnailOperatorAction,
    QuickFindOperatorAction,
    UpdateOperatorAction,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
