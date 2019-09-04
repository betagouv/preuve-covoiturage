import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { RedisConnection } from '@ilos/connection-redis';
import { GeoProvider } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';
import { NormalizationCostAction } from './actions/NormalizationCostAction';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider],
  handlers: [NormalizationGeoAction, NormalizationTerritoryAction, NormalizationCostAction],
  middlewares: [
    // service origin validator
  ],
  connections: [[RedisConnection, 'redis']],
  queues: ['normalization', 'crosscheck'],
  validator: [],
})
export class ServiceProvider extends BaseServiceProvider {}
