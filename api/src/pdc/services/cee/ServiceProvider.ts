import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';

import { config } from './config';
import { binding as importIdentityCeeBinding } from '@shared/cee/importApplicationIdentity.schema';
import { binding as importCeeBinding } from '@shared/cee/importApplication.schema';
import { binding as registerCeeBinding } from '@shared/cee/registerApplication.schema';
import { binding as simulateCeeBinding } from '@shared/cee/simulateApplication.schema';

import { CeeRepositoryProvider } from './providers/CeeRepositoryProvider';
import { ImportCeeAction } from './actions/ImportCeeAction';
import { RegisterCeeAction } from './actions/RegisterCeeAction';
import { SimulateCeeAction } from './actions/SimulateCeeAction';
import { ImportCeeIdentityAction } from './actions/ImportCeeIdentityAction';

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
