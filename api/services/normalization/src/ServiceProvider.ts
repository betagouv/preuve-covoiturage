import { Parents, Container } from '@ilos/core';
import { GeoProvider } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';

@Container.serviceProvider({
  providers: [GeoProvider],
  handlers: [
    NormalizationGeoAction,
    NormalizationTerritoryAction,
  ],
  config: __dirname,
})
export class ServiceProvider extends Parents.ServiceProvider {}
