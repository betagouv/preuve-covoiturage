import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';

import { config } from './config';
import { binding as fetchBinding } from '@shared/company/fetch.schema';
import { binding as findBinding } from '@shared/company/find.schema';
import { CompanyRepositoryProvider } from './providers/CompanyRepositoryProvider';
import { CompanyDataSourceProvider } from './providers/CompanyDataSourceProvider';
import { FetchAction } from './actions/FetchAction';
import { FindAction } from './actions/FindAction';

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
