import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { binding as fetchBinding } from './shared/company/fetch.schema';
import { binding as findBinding } from './shared/company/find.schema';
import { CompanyRepositoryProvider } from './providers/CompanyRepositoryProvider';
import { CompanyDataSourceProvider } from './providers/CompanyDataSourceProvider';
import { FetchAction } from './actions/FetchAction';
import { FindAction } from './actions/FindAction';

@serviceProvider({
  config: __dirname,
  providers: [CompanyRepositoryProvider, CompanyDataSourceProvider],
  validator: [fetchBinding, findBinding],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [FetchAction, FindAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
