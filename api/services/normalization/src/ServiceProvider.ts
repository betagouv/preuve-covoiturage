import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';

import { GeoProvider } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';

@serviceProvider({
  providers: [GeoProvider],
  handlers: [
    NormalizationGeoAction,
    NormalizationTerritoryAction,
  ],
  config: __dirname,
})
export class ServiceProvider extends BaseServiceProvider {}
