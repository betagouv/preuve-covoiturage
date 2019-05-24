import { Parents, Providers, Interfaces } from '@pdc/core';
import { CryptoProviderInterfaceResolver, CryptoProvider } from '@pdc/provider-crypto';

import { CreateUserAction } from './actions/CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from './interfaces/UserRepositoryProviderInterface';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { PatchUserAction } from './actions/PatchUserAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [UserRepositoryProviderInterfaceResolver, UserRepositoryProvider],
    [CryptoProviderInterfaceResolver, CryptoProvider],
  ];

  handlers = [
    CreateUserAction,
    DeleteUserAction,
    FindUserAction,
    ListUserAction,
    PatchUserAction,
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
  }
}
