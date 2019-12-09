import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { PostgresConnection } from '@ilos/connection-postgres';
import { GeoProvider } from '@pdc/provider-geo';
import { ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { WorkflowProvider } from './providers/WorkflowProvider';
import { TerritoryProvider } from './providers/TerritoryProvider';
import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { NormalizationRouteAction } from './actions/NormalizationRouteAction';
import { NormalizationIdentityAction } from './actions/NormalizationIdentityAction';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider, TerritoryProvider, WorkflowProvider],
  handlers: [
    NormalizationGeoAction,
    NormalizationRouteAction,
    NormalizationTerritoryAction,
    NormalizationCostAction,
    NormalizationIdentityAction,
  ],
  middlewares: [['channel.service.only', ChannelServiceWhitelistMiddleware]],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  queues: ['normalization'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {}
