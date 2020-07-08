import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension } from '@pdc/provider-validator';
import { RedisConnection } from '@ilos/connection-redis';
import { GeoProvider } from '@pdc/provider-geo';

import { config } from './config';
import { WorkflowProvider } from './providers/WorkflowProvider';
import { TerritoryProvider } from './providers/TerritoryProvider';
import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { NormalizationRouteAction } from './actions/NormalizationRouteAction';
import { NormalizationIdentityAction } from './actions/NormalizationIdentityAction';
import { NormalizationProcessAction } from './actions/NormalizationProcessAction';

@serviceProvider({
  config,
  providers: [GeoProvider, TerritoryProvider, WorkflowProvider],
  handlers: [
    NormalizationProcessAction,
    NormalizationGeoAction,
    NormalizationRouteAction,
    NormalizationTerritoryAction,
    NormalizationCostAction,
    NormalizationIdentityAction,
  ],
  middlewares: [['channel.service.only', ChannelServiceWhitelistMiddleware]],
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
