import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension } from '@pdc/provider-validator';
import { RedisConnection } from '@ilos/connection-redis';
import { GeoProvider } from '@pdc/provider-geo';

import { config } from './config';
import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { NormalizationRouteAction } from './actions/NormalizationRouteAction';
import { NormalizationIdentityAction } from './actions/NormalizationIdentityAction';
import { NormalizationProcessAction } from './actions/NormalizationProcessAction';

@serviceProvider({
  config,
  providers: [GeoProvider],
  handlers: [
    NormalizationProcessAction,
    NormalizationGeoAction,
    NormalizationRouteAction,
    NormalizationCostAction,
    NormalizationIdentityAction,
  ],
  middlewares: [...defaultMiddlewareBindings],
  connections: [
    [RedisConnection, 'connections.redis'],
    [PostgresConnection, 'connections.postgres'],
  ],
  queues: ['normalization'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
