import { Parents, Providers, Interfaces, Types, Middlewares } from '@pdc/core';
import { CryptoProviderInterfaceResolver, CryptoProvider } from '@pdc/provider-crypto';
import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';


import { CreateUserAction } from './actions/CreateUserAction';
import { UserRepositoryProviderInterfaceResolver } from './interfaces/UserRepositoryProviderInterface';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';
import { UserPermissionsProviderInterfaceResolver } from './interfaces/UserPermissionsProviderInterface';
import { UserPermissionsProvider } from './providers/UserPermissionsProvider';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { PatchUserAction } from './actions/PatchUserAction';
import { userPatchSchema } from './schemas/userPatchSchema';
import { userDeleteSchema } from './schemas/userDeleteSchema';
import { userCreateSchema } from './schemas/userCreateSchema';
import { userFindSchema } from './schemas/userFindSchema';
import { userListSchema } from './schemas/userListSchema';
import { ScopeToSelfMiddleware } from './middlewares/ScopeToSelfMiddleware';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [UserRepositoryProviderInterfaceResolver, UserRepositoryProvider],
    [CryptoProviderInterfaceResolver, CryptoProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    [UserPermissionsProviderInterfaceResolver, UserPermissionsProvider],
  ];

  readonly handlers = [
    CreateUserAction,
    DeleteUserAction,
    FindUserAction,
    ListUserAction,
    PatchUserAction,
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', Middlewares.PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
  ];


  protected readonly validators: [string, any][] = [
    ['user.create', userCreateSchema],
    ['user.patch', userPatchSchema],
    ['user.find', userFindSchema],
    ['user.list', userListSchema],
    ['user.delete', userDeleteSchema],
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
    this.registerValidators();
  }

  private registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}
