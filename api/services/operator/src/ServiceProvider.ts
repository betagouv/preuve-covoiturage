import { Parents, Providers, Interfaces, Middlewares, Types } from '@pdc/core';

import { OperatorRepositoryProviderInterfaceResolver } from './interfaces/OperatorRepositoryProviderInterface';
import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';
import { AllOperatorAction } from './actions/AllOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { PatchOperatorAction } from './actions/PatchOperatorAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [OperatorRepositoryProviderInterfaceResolver, OperatorRepositoryProvider],
  ];

  handlers = [
    AllOperatorAction,
    CreateOperatorAction,
    PatchOperatorAction,
    DeleteOperatorAction,
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', Middlewares.PermissionMiddleware],
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
  }
}
