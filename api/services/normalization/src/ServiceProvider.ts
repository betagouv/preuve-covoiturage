import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { GeoProvider, GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { NormalizationGeoAction } from './actions/NormalizationGeoAction';
import { NormalizationTerritoryAction } from './actions/NormalizationTerritoryAction';


export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [GeoProviderInterfaceResolver, GeoProvider],
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    NormalizationGeoAction,
    NormalizationTerritoryAction,
  ];

  protected readonly validators: [string, any][] = [
  ];

  public async boot() {
    await super.boot();
    this.registerConfig();
  }

  protected registerConfig() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }
}
