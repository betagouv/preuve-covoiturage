import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { GeoProvider } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';
import { WorkflowProvider } from './providers/WorkflowProvider';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider, WorkflowProvider],
  handlers: [NormalizationGeoAction, NormalizationTerritoryAction, NormalizationCostAction],
  middlewares: [
    // service origin validator
  ],
  connections: [[RedisConnection, 'connections.redis']],
  queues: ['normalization', 'crosscheck'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {}
