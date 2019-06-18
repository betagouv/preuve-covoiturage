import { Parents, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { TerritoryRepositoryProviderInterfaceResolver } from './interfaces/TerritoryRepositoryProviderInterface';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { AllTerritoryAction } from './actions/AllTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [[TerritoryRepositoryProviderInterfaceResolver, TerritoryRepositoryProvider]];

  handlers = [AllTerritoryAction, CreateTerritoryAction, PatchTerritoryAction, DeleteTerritoryAction];

  public async boot() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
    await super.boot();
  }
}
