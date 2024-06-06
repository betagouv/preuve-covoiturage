import { ExtensionInterface, NewableType, serviceProvider } from '/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '/ilos/core/index.ts';
import { defaultMiddlewareBindings } from '/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '/pdc/providers/validator/index.ts';
import { binding as createBinding } from '/shared/operator/create.schema.ts';
import { binding as deleteBinding } from '/shared/operator/delete.schema.ts';
import { binding as findBinding } from '/shared/operator/find.schema.ts';
import { binding as findbyuuidBinding } from '/shared/operator/findbyuuid.schema.ts';
import { binding as patchContactsBinding } from '/shared/operator/patchContacts.schema.ts';
import { binding as patchThumbnailBinding } from '/shared/operator/patchThumbnail.schema.ts';
import { binding as quickfindBinding } from '/shared/operator/quickfind.schema.ts';
import { binding as updateBinding } from '/shared/operator/update.schema.ts';
import { CreateOperatorAction } from './actions/CreateOperatorAction.ts';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction.ts';
import { FindByUuidOperatorAction } from './actions/FindByUuidOperatorAction.ts';
import { FindOperatorAction } from './actions/FindOperatorAction.ts';
import { ListOperatorAction } from './actions/ListOperatorAction.ts';
import { PatchContactsOperatorAction } from './actions/PatchContactsOperatorAction.ts';
import { PatchThumbnailOperatorAction } from './actions/PatchThumbnailOperatorAction.ts';
import { QuickFindOperatorAction } from './actions/QuickFindOperatorAction.ts';
import { UpdateOperatorAction } from './actions/UpdateOperatorAction.ts';
import { config } from './config/index.ts';
import { OperatorPgRepositoryProvider } from './providers/OperatorPgRepositoryProvider.ts';

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
