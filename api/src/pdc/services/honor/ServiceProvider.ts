import { ServiceProvider as AbstractServiceProvider } from '@ilos/core/index.ts';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator/index.ts';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware/index.ts';

import { config } from './config/index.ts';
import { binding as saveBinding } from '@shared/honor/save.schema.ts';
import { binding as statsBinding } from '@shared/honor/stats.schema.ts';
import { StatsAction } from './actions/StatsAction.ts';
import { SaveAction } from './actions/SaveAction.ts';
import { HonorRepositoryProvider } from './providers/HonorRepositoryProvider.ts';

@serviceProvider({
  config,
  providers: [HonorRepositoryProvider],
  validator: [saveBinding, statsBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [StatsAction, SaveAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
