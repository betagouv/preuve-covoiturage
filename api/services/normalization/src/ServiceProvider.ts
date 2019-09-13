import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { GeoProvider } from '@pdc/provider-geo';
import { ChannelTransportMiddleware } from '@pdc/provider-middleware';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { WorkflowProvider } from './providers/WorkflowProvider';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider, WorkflowProvider],
  handlers: [NormalizationGeoAction, NormalizationTerritoryAction, NormalizationCostAction],
  middlewares: [['channel.transport', ChannelTransportMiddleware]],
  connections: [[RedisConnection, 'connections.redis']],
  queues: ['normalization', 'trip'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {}
