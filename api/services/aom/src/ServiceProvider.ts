import { Parents, Providers, Interfaces } from '@pdc/core';

import { AomRepositoryProviderInterfaceResolver } from './interfaces/AomRepositoryProviderInterface';
import { AomRepositoryProvider } from './providers/AomRepositoryProvider';
import { AllAomAction } from './actions/AllAomAction';
import { CreateAomAction } from './actions/CreateAomAction';
import { DeleteAomAction } from './actions/DeleteAomAction';
import { PatchAomAction } from './actions/PatchAomAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [[AomRepositoryProviderInterfaceResolver, AomRepositoryProvider]];

  handlers = [AllAomAction, CreateAomAction, PatchAomAction, DeleteAomAction];

  public async boot() {
    this.getContainer()
      .get(Providers.ConfigProvider)
      .loadConfigDirectory(__dirname);
    await super.boot();
  }
}
