import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { CrosscheckProcessAction } from './actions/CrosscheckProcessAction';
import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider';
import { crosscheckProcessSchema } from './schema/crosscheckProcessSchema';

@serviceProvider({
  config: __dirname,
  providers: [CrosscheckRepositoryProvider],
  validator: [['crosscheck.process', crosscheckProcessSchema]],
  middlewares: [['validate', ValidatorMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [CrosscheckProcessAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
