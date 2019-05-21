import { Parents, Providers, Interfaces } from '@pdc/core';

import { CreateUserAction } from './actions/CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from './interfaces/UserRepositoryProviderInterface';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [UserRepositoryProviderInterfaceResolver, UserRepositoryProvider],
  ];

  handlers = [
    CreateUserAction,
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
  }
}
