import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorMiddleware, ValidatorExtension } from '@pdc/providers/validator';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';

import { config } from './config';
import { binding as crosscheckBinding } from '@shared/carpool/crosscheck.schema';
import { binding as findUuidBinding } from '@shared/carpool/finduuid.schema';
import { binding as findIdentitiesBinding } from '@shared/carpool/findidentities.schema';
import { CarpoolRepositoryProvider } from './providers/CarpoolRepositoryProvider';
import { CrosscheckAction } from './actions/CrosscheckAction';
import { FindUuidAction } from './actions/FindUuidAction';
import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider';
import { IdentityRepositoryProvider } from './providers/IdentityRepositoryProvider';
import { UpdateStatusAction } from './actions/UpdateStatusAction';
import { FindIdentitiesAction } from './actions/FindIdentitiesAction';

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
