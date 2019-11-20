import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { PostgresConnection } from '@ilos/connection-postgres';
import { GeoProvider } from '@pdc/provider-geo';
import { ChannelTransportMiddleware } from '@pdc/provider-middleware';

import { WorkflowProvider } from './providers/WorkflowProvider';
import { TerritoryProvider } from './providers/TerritoryProvider';
import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { NormalizationRouteAction } from './actions/NormalizationRouteAction';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider, TerritoryProvider, WorkflowProvider],
  handlers: [NormalizationGeoAction, NormalizationRouteAction, NormalizationTerritoryAction, NormalizationCostAction],
  middlewares: [['channel.transport', ChannelTransportMiddleware]],
  connections: [[RedisConnection, 'connections.redis'], [PostgresConnection, 'connections.postgres']],
  queues: ['normalization', 'trip'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {}
