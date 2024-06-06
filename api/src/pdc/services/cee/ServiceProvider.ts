import { ExtensionInterface, NewableType, serviceProvider } from '/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '/ilos/core/index.ts';
import { defaultMiddlewareBindings } from '/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '/pdc/providers/validator/index.ts';

import { config } from './config/index.ts';
import { binding as importIdentityCeeBinding } from '/shared/cee/importApplicationIdentity.schema.ts';
import { binding as importCeeBinding } from '/shared/cee/importApplication.schema.ts';
import { binding as registerCeeBinding } from '/shared/cee/registerApplication.schema.ts';
import { binding as simulateCeeBinding } from '/shared/cee/simulateApplication.schema.ts';

import { CeeRepositoryProvider } from './providers/CeeRepositoryProvider.ts';
import { ImportCeeAction } from './actions/ImportCeeAction.ts';
import { RegisterCeeAction } from './actions/RegisterCeeAction.ts';
import { SimulateCeeAction } from './actions/SimulateCeeAction.ts';
import { ImportCeeIdentityAction } from './actions/ImportCeeIdentityAction.ts';

@serviceProvider({
  config,
  providers: [CeeRepositoryProvider],
  validator: [importCeeBinding, importIdentityCeeBinding, registerCeeBinding, simulateCeeBinding],
  handlers: [ImportCeeAction, RegisterCeeAction, SimulateCeeAction, ImportCeeIdentityAction],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
