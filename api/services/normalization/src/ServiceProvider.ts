import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';

import { GeoProvider } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';

@serviceProvider({
  config: __dirname,
  providers: [GeoProvider],
  handlers: [NormalizationGeoAction, NormalizationTerritoryAction],
})
export class ServiceProvider extends BaseServiceProvider {}
