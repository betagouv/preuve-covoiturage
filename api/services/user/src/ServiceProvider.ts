import path from 'path';
import { Parents, Interfaces, Types } from '@ilos/core';
import { PermissionMiddleware } from '@ilos/package-acl';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { CryptoProviderInterfaceResolver, CryptoProvider } from '@pdc/provider-crypto';
import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';
import { NotificationProvider, NotificationProviderInterfaceResolver } from '@ilos/provider-notification';

import { CreateUserAction } from './actions/CreateUserAction';
import { DeleteUserAction } from './actions/DeleteUserAction';
import { FindUserAction } from './actions/FindUserAction';
import { NotifyUserAction } from './actions/NotifyUserAction';
import { ListUserAction } from './actions/ListUserAction';
import { PatchUserAction } from './actions/PatchUserAction';
import { ConfirmEmailUserAction } from './actions/ConfirmEmailUserAction';
import { ForgottenPasswordUserAction } from './actions/ForgottenPasswordUserAction';
import { ResetPasswordUserAction } from './actions/ResetPasswordUserAction';
import { ChangePasswordUserAction } from './actions/ChangePasswordUserAction';
import { ChangeEmailUserAction } from './actions/ChangeEmailUserAction';
import { LoginUserAction } from './actions/LoginUserAction';
import { ChangeRoleUserAction } from './actions/ChangeRoleUserAction';
import { UserRepositoryProviderInterfaceResolver } from './interfaces/repository/UserRepositoryProviderInterface';
import { ScopeToSelfMiddleware } from './middlewares/ScopeToSelfMiddleware';
import { UserRepositoryProvider } from './providers/UserRepositoryProvider';
import { userPatchSchema } from './schemas/userPatchSchema';
import { userDeleteSchema } from './schemas/userDeleteSchema';
import { userCreateSchema } from './schemas/userCreateSchema';
import { userFindSchema } from './schemas/userFindSchema';
import { userListSchema } from './schemas/userListSchema';
import { userResetPasswordSchema } from './schemas/userResetPasswordSchema';
import { userForgottenPasswordSchema } from './schemas/userForgottenPasswordSchema';
import { userConfirmEmailSchema } from './schemas/userConfirmEmailSchema';
import { userChangePasswordSchema } from './schemas/userChangePasswordSchema';
import { userChangeEmailSchema } from './schemas/userChangeEmailSchema';
import { userLoginSchema } from './schemas/userLoginSchema';
import { userChangeRoleSchema } from './schemas/userChangeRoleSchema';
import { ContentBlacklistMiddleware } from './middlewares/ContentBlacklistMiddleware';
import { ContentWhitelistMiddleware } from './middlewares/ContentWhitelistMiddleware';
import { TemplateProviderInterfaceResolver, HandlebarsProvider } from '@ilos/provider-template';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [UserRepositoryProviderInterfaceResolver, UserRepositoryProvider],
    [CryptoProviderInterfaceResolver, CryptoProvider],
    [TemplateProviderInterfaceResolver, HandlebarsProvider],
    [NotificationProviderInterfaceResolver, NotificationProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    ChangeEmailUserAction,
    ChangePasswordUserAction,
    ChangeRoleUserAction,
    ConfirmEmailUserAction,
    CreateUserAction,
    DeleteUserAction,
    FindUserAction,
    ForgottenPasswordUserAction,
    NotifyUserAction,
    ListUserAction,
    LoginUserAction,
    PatchUserAction,
    ResetPasswordUserAction,
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
  ];

  protected readonly validators: [string, any][] = [
    ['user.create', userCreateSchema],
    ['user.changePassword', userChangePasswordSchema],
    ['user.changeEmail', userChangeEmailSchema],
    ['user.changeRole', userChangeRoleSchema],
    ['user.confirmEmail', userConfirmEmailSchema],
    ['user.find', userFindSchema],
    ['user.forgottenPassword', userForgottenPasswordSchema],
    ['user.patch', userPatchSchema],
    ['user.list', userListSchema],
    ['user.login', userLoginSchema],
    ['user.delete', userDeleteSchema],
    ['user.resetPassword', userResetPasswordSchema],
  ];

  public async boot() {
    await super.boot();
    this.registerValidators();
    this.registerConfig();
    this.registerTemplate();
  }

  protected registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }

  protected registerConfig() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }

  protected registerTemplate() {
    this.getContainer()
      .get(TemplateProviderInterfaceResolver)
      .loadTemplatesFromDirectory(path.resolve(__dirname, 'templates'));
  }
}
