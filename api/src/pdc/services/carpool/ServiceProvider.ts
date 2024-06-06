import { serviceProvider, NewableType, ExtensionInterface } from '@/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { ValidatorMiddleware, ValidatorExtension } from '@/pdc/providers/validator/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';

import { config } from './config/index.ts';
import { binding as crosscheckBinding } from '@/shared/carpool/crosscheck.schema.ts';
import { binding as findUuidBinding } from '@/shared/carpool/finduuid.schema.ts';
import { binding as findIdentitiesBinding } from '@/shared/carpool/findidentities.schema.ts';
import { CarpoolRepositoryProvider } from './providers/CarpoolRepositoryProvider.ts';
import { CrosscheckAction } from './actions/CrosscheckAction.ts';
import { FindUuidAction } from './actions/FindUuidAction.ts';
import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider.ts';
import { IdentityRepositoryProvider } from './providers/IdentityRepositoryProvider.ts';
import { UpdateStatusAction } from './actions/UpdateStatusAction.ts';
import { FindIdentitiesAction } from './actions/FindIdentitiesAction.ts';

@serviceProvider({
  config,
  providers: [CarpoolRepositoryProvider, CrosscheckRepositoryProvider, IdentityRepositoryProvider],
  validator: [crosscheckBinding, findUuidBinding, findIdentitiesBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [CrosscheckAction, FindUuidAction, FindIdentitiesAction, UpdateStatusAction],
  queues: ['carpool'],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
