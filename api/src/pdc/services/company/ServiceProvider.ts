import { ServiceProvider as AbstractServiceProvider } from '/ilos/core/index.ts';
import { serviceProvider, NewableType, ExtensionInterface } from '/ilos/common/index.ts';
import { defaultMiddlewareBindings } from '/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '/pdc/providers/validator/index.ts';

import { config } from './config/index.ts';
import { binding as fetchBinding } from '/shared/company/fetch.schema.ts';
import { binding as findBinding } from '/shared/company/find.schema.ts';
import { CompanyRepositoryProvider } from './providers/CompanyRepositoryProvider.ts';
import { CompanyDataSourceProvider } from './providers/CompanyDataSourceProvider.ts';
import { FetchAction } from './actions/FetchAction.ts';
import { FindAction } from './actions/FindAction.ts';

@serviceProvider({
  config,
  providers: [CompanyRepositoryProvider, CompanyDataSourceProvider],
  validator: [fetchBinding, findBinding],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [FetchAction, FindAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
