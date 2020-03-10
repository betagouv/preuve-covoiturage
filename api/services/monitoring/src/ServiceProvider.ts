import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@pdc/provider-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { config } from './config';
import { binding as fetchBinding } from './shared/company/fetch.schema';
import { binding as findBinding } from './shared/company/find.schema';
import { FindAction } from './actions/FindAction';

@serviceProvider({
  config,
  providers: [],
  validator: [fetchBinding, findBinding],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [FindAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
